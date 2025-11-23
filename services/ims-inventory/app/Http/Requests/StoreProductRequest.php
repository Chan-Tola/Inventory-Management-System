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
        $productId = $this->route(Product::TABLENAME);

        return [
            Product::NAME => 'required|string|max:255',
            Product::SKU => 'required|string|max:100|unique:' . Product::TABLENAME . ',' . Product::SKU . ',' . $productId,
            Product::CATEGORY_ID => 'required|exists:' . Category::TABLENAME . ',' . Category::ID,
            Product::BRAND => 'required|string|max:255',
            Product::PRICE => 'required|numeric|min:0',
            Product::DESCRIPTION => 'required|string',
            Product::STAFF_ID => 'required|exists:' . 'staffs' . ',' . 'id',
        ];


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
    }
}
