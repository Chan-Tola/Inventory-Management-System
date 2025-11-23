<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;
    const ID = 'id';
    const TABLENAME = 'categories';
    const NAME = 'name';
    const DESCRIPTION = 'description';
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';
    const STAFF_ID = 'staff_id';
    // note: fill table
    protected $table = self::TABLENAME;

    protected $fillable = [
        self::NAME,
        self::DESCRIPTION,
        self::STAFF_ID 
    ];

    public function product()
    {
        return $this->hasMany(Product::class);
    }
    public function staff()
    {
        return $this->belongsTo(staff::class);
    }
}
