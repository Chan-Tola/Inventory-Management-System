<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            Category::ID => $this->id,
            Category::NAME => $this->name,
            Category::CREATED_AT => $this->created_at->toDateTimeString(),
            Category::UPDATED_AT => $this->updated_at->toDateTimeString(),
        ];
    }
}
