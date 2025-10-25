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
            Product::DESCRIPTION => $this->description,


            // include category
            'category'    => $this->category ? [
                'name' => $this->category->name
            ] : null,
            // include staff (issuse maybe about getway not yes get staff)
            // 'staff' => $this->staff ? [
            //     'name' => optional($this->staff->user)->name,
            // ] : null,

            // note: images
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(function ($image) {
                    return [
                        ProductImage::ID => $image->{ProductImage::ID},
                        'url' => $image->{ProductImage::IMAGE_URL},
                        'public_id' =>  $image->{ProductImage::IMAGE_PUBLIC_ID},
                        ProductImage::IS_PRIMARY => (bool) $image->{ProductImage::IS_PRIMARY},
                    ];
                });
            }),

            'primary_image' => $this->whenLoaded('images', function () {
                $primaryImage = $this->images->where(ProductImage::IS_PRIMARY, true)->first();
                if ($primaryImage) {
                    return [
                        'url' => $primaryImage->{ProductImage::IMAGE_URL},
                        'public_id' =>  $primaryImage->{ProductImage::IMAGE_PUBLIC_ID},
                    ];
                }
            }),
            Product::CREATED_AT => $this->created_at?->toDateTimeString(),
            Product::UPDATED_AT => $this->updated_at?->toDateTimeString(),
        ];
    }
}
