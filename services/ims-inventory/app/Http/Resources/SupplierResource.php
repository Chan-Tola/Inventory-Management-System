<?php

namespace App\Http\Resources;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            Supplier::ID => $this->id,
            Supplier::NAME => $this->name,
            Supplier::CONTACT => $this->contact,
            Supplier::ADDRESS => $this->address,
            Supplier::CREATED_AT => $this->created_at?->toDateTimeString(),
            Supplier::UPDATED_AT => $this->updated_at?->toDateTimeString(),
        ];
    }
}
