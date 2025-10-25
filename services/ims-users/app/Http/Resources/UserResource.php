<?php

namespace App\Http\Resources;

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
                Staff::STAFF_CODE => $this->staff->staff_code,
                Staff::GENDER => $this->staff->gender,
                Staff::PHONE => $this->staff->phone,
                Staff::ADDRESS => $this->staff->address,
                Staff::SALARY => $this->staff->salary,
                Staff::HIRE_DATE => $this->staff->hire_date,
            ] : null,

            /* Customer datas reponse as json
             Include relationship data if available */
            // 'customer' => $this->customer ? [
            //     'customer_code' => $this->customer->customer_code,
            // ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
