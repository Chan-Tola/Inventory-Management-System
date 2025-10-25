<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    const TABLENAME = 'stocks';
    // note: fk product_id from table Product
    const ID = 'id';
    const PRODUCT_ID = 'product_id';
    const QUANTITY = 'quantity';
    const MIN_QUANTITY = 'min_quantity';
    // const UNIT = 'unit';
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';
    protected $table = self::TABLENAME;
    protected $fillable = [
        self::PRODUCT_ID,
        self::QUANTITY,
        self::MIN_QUANTITY,
        // self::UNIT,
    ];

    //note: default for when min_quantity is not provide
    protected $attributes = [
        'min_quantity' => 10, // Default satety stock
    ];

    //note: relationship wiht Product 
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    //note: mehtod to check if stock is low
    public function isLowStock()
    {
        return $this->quantity <= $this->min_quantity;
    }
}
