<?php

namespace App\Http\Resources;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
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
            'customer' => $this->customer ? [
                Customer::ID => $this->customer->id,
                Customer::CUSTOMER_CODE => $this->customer->customer_code,
                Customer::GENDER => $this->customer->gender,
                Customer::ADDRESS => $this->customer->address,
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
