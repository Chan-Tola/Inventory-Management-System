<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_type' => $this->transaction_type,
            'transaction_type_display' => $this->getTransactionTypeDisplay(),
            'quantity' => $this->quantity,
            'address' => $this->address,
            'transaction_date' => $this->transaction_date,
            'notes' => $this->notes,

            // ✅ ADD: Money fields
            'amount' => $this->amount,
            'money_type' => $this->money_type,
            'money_impact' => $this->getMoneyImpact(),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Product information
            'product' => $this->whenLoaded('product', function () {
                return [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                ];
            }),

            // Supplier information
            'supplier' => $this->whenLoaded('supplier', function () {
                return $this->supplier ? [
                    'id' => $this->supplier->id,
                    'name' => $this->supplier->name,
                    'address' => $this->supplier->address,
                ] : null;
            }),

            // ✅ FIX: Change to string key
            'staff_id' => $this->staff_id,

            // Stock impact (calculated)
            'stock_impact' => $this->getStockImpact(),
        ];
    }

    /**
     * Get display name for transaction type
     */
    private function getTransactionTypeDisplay(): string
    {
        return match ($this->transaction_type) {
            'in' => 'Stock In',
            'out' => 'Stock Out',
            default => ucfirst($this->transaction_type)
        };
    }

    /**
     * Get stock impact (positive for in, negative for out)
     */
    private function getStockImpact(): int
    {
        return $this->transaction_type === 'in' ? $this->quantity : -$this->quantity;
    }

    /**
     * ✅ ADD: Get money impact (positive for income, negative for expense)
     */
    private function getMoneyImpact(): float
    {
        if (!$this->amount || !$this->money_type) {
            return 0;
        }

        return $this->money_type === 'income'
            ? $this->amount
            : -$this->amount;
    }
}
