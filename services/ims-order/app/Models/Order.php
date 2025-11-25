<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Services\InventoryService;
use Illuminate\Support\Facades\Log;

class Order extends Model
{
    const TABLENAME = 'orders';
    const ID = 'id';
    const ORDER_CODE = 'order_code';
    const CUSTOMER_ID = 'customer_id';
    const STAFF_ID = 'staff_id';
    const TOTAL_AMOUNT = 'total_amount';
    const STATUS = 'status';
    const ORDER_DATE = 'order_date';

    protected $table = self::TABLENAME;

    protected $fillable = [
        self::ORDER_CODE,
        self::CUSTOMER_ID,
        self::STAFF_ID,
        self::TOTAL_AMOUNT,
        self::STATUS,
        self::ORDER_DATE,
    ];

    protected $attributes = [
        self::STATUS => 'completed',
    ];

    protected static function booted()
    {
        static::creating(function ($order) {
            if (!$order->{self::ORDER_CODE}) {
                $order->{self::ORDER_CODE} = 'ORD' . rand(1000, 9999);
            }
            if (!$order->{self::ORDER_DATE}) {
                $order->{self::ORDER_DATE} = now();
            }
        });

        static::created(function ($order) {
            // ✅ Load the items relationship first
            $order->load('items');

            Log::info('🔄 Creating inventory transactions for order', [
                'order_id' => $order->id,
                'items_count' => $order->items->count()
            ]);

            // Create inventory transactions for each item
            foreach ($order->items as $item) {
                $order->createInventoryTransaction($item);
            }
        });
    }

    // ✅ Create inventory transaction for stock out
    public function createInventoryTransaction($item)
    {
        $inventoryService = new InventoryService();

        $result = $inventoryService->createTransaction([
            'transaction_type' => 'out',
            'product_id' => $item->product_id,
            'quantity' => $item->quantity,
            'staff_id' => $this->staff_id,
            'order_id' => $this->id,
            'amount' => $item->unit_price * $item->quantity,
            'money_type' => 'income',
            'notes' => "Order #{$this->order_code} - {$item->quantity} units sold"
        ]);

        if (!$result['success']) {
            Log::error('Failed to create inventory transaction for order', [
                'order_id' => $this->id,
                'product_id' => $item->product_id,
                'error' => $result['error']
            ]);
        } else {
            Log::info('Inventory transaction created successfully for order', [
                'order_id' => $this->id,
                'product_id' => $item->product_id,
                'transaction_data' => $result['data']
            ]);
        }

        return $result;
    }

    // ✅ Relationships
    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }
}
