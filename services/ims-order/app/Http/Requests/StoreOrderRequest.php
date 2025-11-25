<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'staff_id' => 'required|exists:' . 'staffs' . ',' . 'id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',


            'user' => 'sometimes|array',
            'user_id' => 'sometimes|integer',
            'user_permission' => 'sometimes|array',
            'user_roles' => 'sometimes|array',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'Customer is required',
            'customer_id.exists' => 'Selected customer does not exist',
            'staff_id.required' => 'Staff is required',
            'staff_id.exists' => 'Selected staff does not exist',
            'items.required' => 'Order items are required',
            'items.min' => 'At least one item is required',
            'items.*.product_id.required' => 'Product is required for all items',
            'items.*.product_id.exists' => 'Selected product does not exist',
            'items.*.quantity.required' => 'Quantity is required for all items',
            'items.*.quantity.min' => 'Quantity must be at least 1',
            'items.*.unit_price.required' => 'Unit price is required for all items',
            'items.*.unit_price.min' => 'Unit price must be at least 0',
        ];
    }
    protected function prepareForValidation()
    {
        // If staff_id is not provided but user.staff.id exists, use it
        if (!$this->has('staff_id') && $this->has('user.staff.id')) {
            $this->merge([
                'staff_id' => $this->input('user.staff.id')
            ]);
        }
    }
}
