<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;
    //note: table name
    const TABLENAME = 'products';
    const ID = 'id';
    const NAME = 'name';
    const SKU = 'sku';
    const BRAND = 'brand';
    const PRICE = 'price';
    const DESCRIPTION = 'description';
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';
    //note: FK catgoriest
    const CATEGORY_ID = 'category_id';
    //note: FK staff
    const STAFF_ID = 'staff_id';

    // note: fill tablename
    protected $table = self::TABLENAME;
    // note: fillable
    protected $fillable = [
        self::NAME,
        self::SKU,
        self::CATEGORY_ID,
        self::BRAND,
        self::PRICE,
        self::DESCRIPTION,
        self::STAFF_ID
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function stock()
    {
        return $this->hasOne(Stock::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, Transaction::SUPPLIER_ID);
    }
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
