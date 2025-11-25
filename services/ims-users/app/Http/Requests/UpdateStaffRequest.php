<?php

namespace App\Http\Requests;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffRequest extends FormRequest
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
            // Only validate fields that should be updated
            User::NAME => 'required|string|max:255',
            Staff::PHONE => 'required|string|max:20',
            Staff::ADDRESS => 'required|string|max:500',
            Staff::SALARY => 'required|numeric|min:0',
            Staff::PROFILE_URL => 'nullable|string', // Simple base64 string
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            User::NAME => $this->name,
            Staff::PHONE => $this->phone,
            Staff::ADDRESS => $this->address,
            Staff::SALARY => $this->salary,
            Staff::PROFILE_URL => $this->profile_url ?: null,
        ]);
    }
}
