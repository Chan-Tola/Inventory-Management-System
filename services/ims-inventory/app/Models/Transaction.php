<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    const TABLENAME = 'transactions';
    const ID = 'id';
    const TRANSACTION_TYPE = 'transaction_type';
    const PRODUCT_ID = 'product_id';
    const QUANTITY = 'quantity';
    const TRANSACTION_DATE = 'transaction_date';
    const STAFF_ID = 'staff_id';
    const SUPPLIER_ID = 'supplier_id';
    const ORDER_ID = 'order_id';
    const NOTES = 'notes';
    const AMOUNT = 'amount';
    const MONEY_TYPE = 'money_type';

    // ✅ ADD: Money types
    const MONEY_INCOME = 'income';
    const MONEY_EXPENSE = 'expense';

    // Transaction types
    const TYPE_IN = 'in';
    const TYPE_OUT = 'out';

    protected $table = self::TABLENAME;

    protected $fillable = [
        self::TRANSACTION_TYPE,
        self::PRODUCT_ID,
        self::QUANTITY,
        self::TRANSACTION_DATE,
        self::STAFF_ID,
        self::SUPPLIER_ID,
        self::NOTES,
        self::AMOUNT,
        self::MONEY_TYPE,
    ];

    protected $attributes = [
        self::TRANSACTION_DATE => null,
    ];

    protected static function booted()
    {
        static::creating(function ($transaction) {
            // Auto-set transaction date if not provided
            if (!$transaction->{self::TRANSACTION_DATE}) {
                $transaction->{self::TRANSACTION_DATE} = now();
            }
        });

        static::created(function ($transaction) {
            // Auto-update stock when transaction is created
            $transaction->updateStockOnCreate();
        });

        static::updated(function ($transaction) {
            // Only update stock if quantity or type changed
            if ($transaction->isDirty([self::QUANTITY, self::TRANSACTION_TYPE])) {
                $transaction->updateStockOnUpdate();
            }
        });

        static::deleting(function ($transaction) {
            // Update stock BEFORE deleting (reverse the transaction)
            $transaction->updateStockOnDelete();
        });
    }

    /**
     * Update stock when creating NEW transaction
     */
    public function updateStockOnCreate()
    {
        $productId = $this->{self::PRODUCT_ID};
        $stock = Stock::where('product_id', $productId)->first();

        // Calculate change based on transaction type
        $change = $this->getQuantityChange();

        $currentQuantity = $stock ? $stock->quantity : 0;
        $newQuantity = max(0, $currentQuantity + $change);

        $this->updateOrCreateStock($productId, $newQuantity);
    }

    /**
     * Update stock when UPDATING existing transaction
     */
    public function updateStockOnUpdate()
    {
        $productId = $this->{self::PRODUCT_ID};

        // ១. លុបឥទ្ធិពលចាស់ (Reverse old impact)
        $oldChange = $this->getOldQuantityChange();

        // ២. បន្ថែមឥទ្ធិពលថ្មី (Add new impact)
        $newChange = $this->getQuantityChange();

        // ៣. គណនាការផ្លាស់ប្តូរសរុប
        $totalChange = $newChange - $oldChange;

        $stock = Stock::where('product_id', $productId)->first();
        $currentQuantity = $stock ? $stock->quantity : 0;
        $newQuantity = max(0, $currentQuantity + $totalChange);

        $this->updateOrCreateStock($productId, $newQuantity);
    }

    /**
     * Update stock when DELETING transaction
     */
    public function updateStockOnDelete()
    {
        $productId = $this->{self::PRODUCT_ID};

        // Reverse the transaction (លុបឥទ្ធិពលចាស់)
        $oldChange = $this->getQuantityChange();
        $reverseChange = -$oldChange; // ត្រឡប់ការផ្លាស់ប្តូរ

        $stock = Stock::where('product_id', $productId)->first();

        if ($stock) {
            $newQuantity = max(0, $stock->quantity + $reverseChange);
            $stock->update(['quantity' => $newQuantity]);
        }
    }

    /**
     * Get quantity change for CURRENT transaction values
     */
    private function getQuantityChange(): int
    {
        if ($this->{self::TRANSACTION_TYPE} === self::TYPE_IN) {
            return $this->{self::QUANTITY};
        } elseif ($this->{self::TRANSACTION_TYPE} === self::TYPE_OUT) {
            return -$this->{self::QUANTITY};
        }

        return 0;
    }

    /**
     * Get OLD quantity change (before update)
     */
    private function getOldQuantityChange(): int
    {
        $oldType = $this->getOriginal(self::TRANSACTION_TYPE);
        $oldQuantity = $this->getOriginal(self::QUANTITY);

        if ($oldType === self::TYPE_IN) {
            return $oldQuantity;
        } elseif ($oldType === self::TYPE_OUT) {
            return -$oldQuantity;
        }

        return 0;
    }

    /**
     * Update or create stock record
     */
    private function updateOrCreateStock($productId, $quantity)
    {
        $stock = Stock::where('product_id', $productId)->first();

        if ($stock) {
            $stock->update(['quantity' => $quantity]);
        } else {
            $product = Product::find($productId);
            Stock::create([
                'product_id' => $productId,
                'quantity' => $quantity,
                'unit' => $product->unit ?? 'pcs',
                'min_quantity' => 10
            ]);
        }
    }

    /**
     * Reconcile stock - for fixing data issues
     */
    public static function reconcileStock($productId)
    {
        $calculatedStock = Transaction::where(self::PRODUCT_ID, $productId)
            ->selectRaw("SUM(CASE WHEN transaction_type = 'in' THEN quantity ELSE -quantity END) as total")
            ->value('total') ?? 0;

        $stock = Stock::where('product_id', $productId)->first();
        $newQuantity = max(0, $calculatedStock);

        if ($stock) {
            $stock->update(['quantity' => $newQuantity]);
        } else {
            $product = Product::find($productId);
            Stock::create([
                'product_id' => $productId,
                'quantity' => $newQuantity,
                'unit' => $product->unit ?? 'pcs',
                'min_quantity' => 10
            ]);
        }

        return $newQuantity;
    }

    // ✅ ADD: Check if it's a money transaction
    public function isMoneyTransaction(): bool
    {
        return !is_null($this->{self::AMOUNT});
    }

    // ✅ ADD: Get money impact (positive for income, negative for expense)
    public function getMoneyImpact(): float
    {
        if (!$this->isMoneyTransaction()) return 0;

        return $this->{self::MONEY_TYPE} === 'income'
            ? $this->{self::AMOUNT}
            : -$this->{self::AMOUNT};
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, self::SUPPLIER_ID);
    }

    public function product()
    {
        return $this->belongsTo(Product::class, self::PRODUCT_ID);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class, self::STAFF_ID);
    }
}
