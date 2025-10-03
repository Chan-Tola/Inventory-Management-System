<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductImage extends Model
{
    use HasFactory;
    public const TABLE = 'product_images';

    public const ID = 'id';
    public const PRODUCT_ID = 'product_id';
    public const IMAGE_URL = 'image_url';
    public const IS_PRIMARY = 'is_primary';
    public const CREATED_AT = 'created_at';
    public const UPDATED_AT = 'updated_at';

    protected $table = self::TABLE;

    protected $fillable = [
        self::PRODUCT_ID,
        self::IMAGE_URL,
        self::IS_PRIMARY,
    ];

    protected $casts = [
        self::IS_PRIMARY => 'boolean',
    ];

    // Relationship to Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
