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

        $rules = [
            Product::NAME => 'sometimes|string|max:255',
            Product::SKU => 'sometimes|string|max:100|unique:'
                . Product::TABLENAME . ',' . Product::SKU
                . ($productId ? ',' . $productId : ''),
            Product::CATEGORY_ID => 'sometimes|exists:' . Category::TABLENAME . ',' . Category::ID,
            Product::BRAND => 'sometimes|string|max:255',
            Product::PRICE => 'sometimes|numeric|min:0',
            Product::DESCRIPTION => 'sometimes|string|nullable',
            Product::STAFF_ID => 'sometimes|exists:staffs,id',
        ];

        // ✅ Image validation (this part was never running before) 
        // Check if images are files, base64, or raw file data
        if ($this->hasFile('images')) {
            // Handle both single file and multiple files
            if (is_array($this->file('images'))) {
                // Multiple files
                $rules['images.*'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:2048';
            } else {
                // Single file
                $rules['images'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:2048';
            }
        } elseif ($this->has('images')) {
            if (is_array($this->images) && isset($this->images[0]['data'])) {
                // Base64 images
                $rules['images.*.data'] = 'required|string';
            } else {
                // Raw file data from gateway - minimal validation
                $rules['images'] = 'array';
            }
        }



        return $rules;
    }
}
