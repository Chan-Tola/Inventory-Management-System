<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            Product::ID => $this->id,
            Product::NAME => $this->name,
            Product::SKU => $this->sku,
            Product::CATEGORY_ID => $this->category_id,
            Product::BRAND => $this->brand,
            Product::PRICE => $this->price,
            Product::SALE_PRICE => $this->sale_price,
            Product::DESCRIPTION => $this->description,
            Product::STAFF_ID => $this->staff_id,
            // include category
            'category' => $this->category ? [
                'name' => $this->category->name
            ] : null,

            // FIX: Use whenLoaded OR fallback to relationship access
            'images' => $this->relationLoaded('images')
                ? $this->images->map(function ($image) {
                    return [
                        ProductImage::ID => $image->{ProductImage::ID},
                        'url' => $image->{ProductImage::IMAGE_URL},
                        'public_id' => $image->{ProductImage::IMAGE_PUBLIC_ID},
                        ProductImage::IS_PRIMARY => (bool) $image->{ProductImage::IS_PRIMARY},
                    ];
                })
                : $this->images()->get()->map(function ($image) {
                    return [
                        ProductImage::ID => $image->{ProductImage::ID},
                        'url' => $image->{ProductImage::IMAGE_URL},
                        'public_id' => $image->{ProductImage::IMAGE_PUBLIC_ID},
                        ProductImage::IS_PRIMARY => (bool) $image->{ProductImage::IS_PRIMARY},
                    ];
                }),

            'primary_image' => (function () {
                $images = $this->relationLoaded('images')
                    ? $this->images
                    : $this->images()->get();

                $primaryImage = $images->where(ProductImage::IS_PRIMARY, 1)->first();

                return $primaryImage ? [
                    'url' => $primaryImage->{ProductImage::IMAGE_URL},
                    'public_id' => $primaryImage->{ProductImage::IMAGE_PUBLIC_ID},
                ] : null;
            })(),

            Product::CREATED_AT => $this->created_at?->toDateTimeString(),
            Product::UPDATED_AT => $this->updated_at?->toDateTimeString(),
        ];
    }
}
