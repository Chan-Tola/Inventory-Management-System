<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // allow anyone to make this request
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            Category::NAME => 'required|string|max:255|unique:categories,name', //note: Use unique:categories,name whenever you want no two categories to have the same name.
            Category::DESCRIPTION => 'nullable|string|max:500',
        ];
    }

    // messages for validator errors.
    // public function messages(): array
    // {
    //     return [
    //         'name.required' => 'The category name is required.',
    //         'name.unique' => 'This category name already exists.',
    //         'name.max' => 'The category name may not be greater than 255 characters.',
    //     ];
    // }
}
