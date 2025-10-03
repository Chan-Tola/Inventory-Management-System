<?php

namespace App\Http\Requests;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [
            Product::NAME => 'required|String|max:255',
            Product::SKU => 'required|string|max:100|unique:' . Product::TABLENAME . ',' . Product::SKU,
            Product::CATEGORY_ID => 'required|exists:' . Category::TABLENAME . ',' . Category::ID,
            Product::BRAND => 'required|string|max:255',
            Product::PRICE => 'required|numeric|min:0',
            Product::DESCRIPTION => 'required|string',
        ];
    }
}
