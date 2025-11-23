<?php

namespace App\Http\Resources;

use App\Models\Customer;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // note: User datas repsonse as js
            User::ID => $this->id,
            User::NAME => $this->name,
            User::EMAIL => $this->email,
            User::IS_ACTIVE => $this->is_active,
            'roles' => $this->getRoleNames(),
            'permission' => $this->getAllPermissions()->pluck('name'),
            /* Staff datas reponse as json
             Include relationship data if available */
            'staff' => $this->staff ? [
                Staff::ID => $this->staff->id,
                Staff::STAFF_CODE => $this->staff->staff_code,
                Staff::PROFILE_URL => $this->staff->profile_url,
                Staff::GENDER => $this->staff->gender,
                Staff::PHONE => $this->staff->phone,
                Staff::ADDRESS => $this->staff->address,
                Staff::SALARY => $this->staff->salary,
                Staff::HIRE_DATE => $this->staff->hire_date,
            ] : null,

            'customer' => $this->customer ? [
                Customer::ID => $this->customer->id,
                Customer::USER_ID => $this->customer->user_id,
                Customer::CUSTOMER_CODE => $this->customer->customer_code,
                Customer::GENDER => $this->customer->gender,
                Customer::ADDRESS => $this->customer->address,
            ] : null,

            // User type for easy filtering in React
            'type' => $this->getUserType(),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function getUserType(): string
    {
        if ($this->staff) return 'staff';
        if ($this->customer) return 'customer';
        return 'user';
    }
}
