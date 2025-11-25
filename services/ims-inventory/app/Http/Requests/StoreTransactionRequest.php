<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'transaction_type' => 'required|in:in,out',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'staff_id' => 'required|exists:' . 'staffs' . ',' . 'id',        // ✅ Now validates FK
            'supplier_id' => 'nullable|exists:suppliers,id',  // ✅ Now validates FK
            'order_id' => 'nullable|integer', // ✅ ADD THIS
            // ✅ ADD: Simple money validation
            'amount' => 'nullable|numeric|min:0',
            'money_type' => 'nullable|in:income,expense',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
