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
        $productId = $this->route('product');
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
        // Check if images are files, base64, or raw file data
        if ($this->hasFile('images')) {
            // Direct file upload
            $rules['images.*'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        } elseif (isset($this->images[0]['data'])) {
            // Base64 images
            $rules['images.*.data'] = 'required|string';
        } else {
            // Raw file data from gateway - minimal validation
            $rules['images.*'] = 'array';
        }
    }
}
