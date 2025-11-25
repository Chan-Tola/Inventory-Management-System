<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    const TABLENAME = 'order_items';
    const ID = 'id';
    const ORDER_ID = 'order_id';
    const PRODUCT_ID = 'product_id';
    const QUANTITY = 'quantity';
    const UNIT_PRICE = 'unit_price';
    const TOTAL_PRICE = 'total_price';

    protected $table = self::TABLENAME;

    protected $fillable = [
        self::ORDER_ID,
        self::PRODUCT_ID,
        self::QUANTITY,
        self::UNIT_PRICE,
        self::TOTAL_PRICE,
    ];

    protected $attributes = [
        self::QUANTITY => 1,
    ];

    protected static function booted()
    {
        static::creating(function ($item) {
            // Auto-calculate total price
            if (!$item->{self::TOTAL_PRICE}) {
                $item->{self::TOTAL_PRICE} = $item->{self::QUANTITY} * $item->{self::UNIT_PRICE};
            }
        });
    }

    // ✅ Relationships
    public function order()
    {
        return $this->belongsTo(Order::class, self::ORDER_ID);
    }

    public function product()
    {
        return $this->belongsTo(Product::class, self::PRODUCT_ID);
    }

    // ✅ Helper methods
    public function getSubtotal(): float
    {
        return $this->quantity * $this->unit_price;
    }

    public function getFormattedSubtotal(): string
    {
        return '$' . number_format($this->getSubtotal(), 2);
    }
}
