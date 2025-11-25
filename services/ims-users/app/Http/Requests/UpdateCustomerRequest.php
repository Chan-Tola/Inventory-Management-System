<?php

namespace App\Http\Requests;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
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
            // User data validation
            User::NAME      => 'required|string|max:255',
            // Customer data validation
            Customer::GENDER  => 'sometimes|required|in:male,female,other', // Change to sometimes
            Customer::ADDRESS => 'required|string|max:500',
        ];
    }
}
