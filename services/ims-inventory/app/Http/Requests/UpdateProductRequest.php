<?php

namespace App\Http\Requests;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
        $productId = $this->route(Product::TABLENAME);
        // assumes your route looks like /products/{product}
        //
        return [
            Product::NAME => 'required|string|max:255',
            Product::SKU => 'required|string|max:100|unique:'
                . Product::TABLENAME . ',' . Product::SKU
                . ($productId ? ',' . $productId : ''),
            Product::CATEGORY_ID => 'required|exists:' . Category::TABLENAME . ',' . Category::ID,
            Product::BRAND => 'required|string|max:255',
            Product::PRICE => 'required|numeric|min:0',
            Product::DESCRIPTION => 'nullable|string',
        ];
    }
}
