<?php

namespace App\Http\Requests;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreStaffRequest extends FormRequest
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
        $rules = [
            // User data validation
            User::NAME => 'required|string|max:255',
            User::EMAIL => 'required|email|unique:' . User::TABLENAME . ',' . User::EMAIL,
            User::PASSWORD => 'required|string|min:8',
            User::IS_ACTIVE => 'sometimes|boolean',
            // Staff data validation
            Staff::GENDER => 'required|in:male,female,other',
            Staff::PHONE => 'required|string|max:20',
            Staff::ADDRESS => 'required|string|max:500',
            Staff::SALARY => 'required|numeric|min:0',
            Staff::HIRE_DATE => 'required|date|before_or_equal:today',
            // Roles validation
            'roles' => 'sometimes|array',
            'roles.*' => 'string|in:admin,staff',
        ];

        if ($this->hasFile(Staff::PROFILE_URL)) {
            // Single file
            $rules[Staff::PROFILE_URL] = 'image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        } elseif ($this->has(Staff::PROFILE_URL)) {
            // Base64 or existing URL validation
            if ($this->isBase64Image($this->{Staff::PROFILE_URL})) {
                // Base64 images
                $rules[Staff::PROFILE_URL] = 'string'; // Base64 image data
            } else {
                $rules[Staff::PROFILE_URL] = 'nullable|url|max:1000'; // Existing URL
            }
        } else {
            // No image provided - make it optional
            $rules[Staff::PROFILE_URL] = 'nullable';
        }
        /**
         * Check if the value is a base64 encoded image
         */

        return $rules;
    }
    private function isBase64Image($value): bool
    {
        if (!is_string($value)) {
            return false;
        }

        if (preg_match('/^data:image\/(\w+);base64,/', $value)) {
            return true;
        }
        return false;
    }
}
