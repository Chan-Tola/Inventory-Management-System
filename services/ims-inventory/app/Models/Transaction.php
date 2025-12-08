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



    // protected static function booted()
    // {
    //     static::creating(function ($transaction) {
    //         // Auto-set transaction date if not provided
    //         if (!$transaction->{self::TRANSACTION_DATE}) {
    //             $transaction->{self::TRANSACTION_DATE} = now();
    //         }
    //     });

    //     static::created(function ($transaction) {
    //         // Auto-update stock when transaction is created
    //         $transaction->updateStock();
    //     });
    // }

    // public function updateStock()
    // {
    //     $currentStock = $this->calculateCurrentStock();

    //     // Update or create stock record
    //     Stock::updateOrCreate(
    //         ['product_id' => $this->{self::PRODUCT_ID}], // ✅ Use string or constant
    //         ['quantity' => $currentStock] // ✅ Match your column name
    //     );
    // }
    
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
            $transaction->updateStock();
        });

        // ✅ ADD: Update stock when transaction is updated
        static::updated(function ($transaction) {
            $transaction->updateStock();
        });

        // ✅ ADD: Update stock when transaction is deleted
        static::deleted(function ($transaction) {
            $transaction->updateStock();
        });
    }

    /**
     * Update or create stock record based on all transactions
     */
    public function updateStock()
    {
        $productId = $this->{self::PRODUCT_ID};
        $currentStock = $this->calculateCurrentStock($productId);

        // Get product details to check if product exists
        $product = Product::find($productId);

        if (!$product) {
            // Product doesn't exist (shouldn't happen if foreign key constraint works)
            return;
        }

        // Get existing stock record
        $stock = Stock::where('product_id', $productId)->first();

        if ($stock) {
            // Update existing stock record
            $stock->update([
                'quantity' => $currentStock
            ]);
        } else {
            // Create new stock record for the first time
            Stock::create([
                'product_id' => $productId,
                'quantity' => max(0, $currentStock), // Ensure non-negative
                'unit' => $product->unit ?? 'pcs', // Use product's unit if available
                'min_quantity' => 10 // Default safety stock
            ]);
        }
    }
    /**
     * Calculate current stock from all transactions
     */
    private function calculateCurrentStock()
    {
        return Transaction::where(self::PRODUCT_ID, $this->{self::PRODUCT_ID})
            ->selectRaw("SUM(CASE WHEN transaction_type = 'in' THEN quantity ELSE -quantity END) as total")
            ->value('total') ?? 0;
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
}
