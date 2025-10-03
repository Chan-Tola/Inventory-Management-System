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
    const UNIT = 'unit';
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';
    protected $table = self::TABLENAME;
    protected $fillable = [
        self::PRODUCT_ID,
        self::QUANTITY,
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
