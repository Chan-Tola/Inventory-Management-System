<?php

namespace App\Http\Resources;

use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            Stock::ID => $this->id,
            Stock::PRODUCT_ID => $this->product_id,
            Stock::QUANTITY => $this->quantity,
            Stock::MIN_QUANTITY => $this->min_quantity,
            Stock::CREATED_AT => $this->created_at?->toDateTimeString(),
            Stock::UPDATED_AT => $this->updated_at?->toDateTimeString(),
            Stock::UNIT => $this->unit,
        ];
    }
}
