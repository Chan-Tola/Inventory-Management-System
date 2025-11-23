<?php

namespace App\Http\Requests;

use App\Models\Product;
use App\Models\Stock;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStockRequest extends FormRequest
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
            Stock::PRODUCT_ID => 'required|exists:' . Product::TABLENAME . ',' . Product::ID,
            Stock::QUANTITY => 'sometimes|required|numeric|min:0',
            Stock::MIN_QUANTITY => 'sometimes|required|numeric|min:0',
            Stock::UNIT => 'sometimes|require|string|max:50',
        ];
    }
}
