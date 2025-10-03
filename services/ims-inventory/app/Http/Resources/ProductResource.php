<?php

namespace App\Http\Resources;

use App\Models\Product;
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
            Product::CREATED_AT => $this->created_at->toDateTimeString(),
            Product::UPDATED_AT => $this->updated_at->toDateTimeString(),
        ];
    }
}
