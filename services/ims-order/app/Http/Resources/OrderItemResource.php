<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    private $productNames;

    public function __construct($resource, $productNames = [])
    {
        parent::__construct($resource);
        $this->productNames = $productNames;
    }
    
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->productNames[$this->product_id] ?? 'Product #' . $this->product_id,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'subtotal' => $this->quantity * $this->unit_price,
        ];
    }
}
