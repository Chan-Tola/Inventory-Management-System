<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{

    public function toArray(Request $request): array
    {

        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'customer_name' => $this->customer_name ?? 'Unknown Customer', // ✅ Added
            'order_code' => $this->order_code,
            'staff_id' => $this->staff_id,
            'staff_name' => $this->staff_name ?? 'Unknown Staff', // ✅ Added
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'order_date' => $this->order_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Only include items if the relationship is loaded
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name ?? 'Unknown Product', // ✅ Now available
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'subtotal' => $item->quantity * $item->unit_price,
                    ];
                });
            }),
            // 'items' => $this->whenLoaded('items', function () {
            //     return OrderItemResource::collection($this->items, $this->productNames);
            // }),
        ];
    }
}
