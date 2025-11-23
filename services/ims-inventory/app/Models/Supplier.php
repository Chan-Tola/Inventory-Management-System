<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    const TABLENAME = 'suppliers';
    // note: fk product_id from table Product
    const ID = 'id';
    const NAME = 'name';
    const CONTACT = 'contact';
    const ADDRESS = 'address';
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';
    protected $table = self::TABLENAME;
    protected $fillable = [
        self::NAME,
        self::CONTACT,
        self::ADDRESS,
    ];

    //note: relationship wiht Product 
    // public function product()
    // {
    //     return $this->belongsTo(Product::class);
    // }

}
