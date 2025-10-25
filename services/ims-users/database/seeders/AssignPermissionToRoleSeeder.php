<?php

namespace Database\Seeders;

use App\Constants\PermissionConstant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AssignPermissionToRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = Role::where('name', 'Admin')->first();
        $staff = Role::where('name', 'Staff')->first();
        $customer = Role::where('name', 'Customer')->first();

        // note:: assign all permissions to admin
        // category
        $admin->givePermissionTo(PermissionConstant::VIEW_CATEGORY);
        $admin->givePermissionTo(PermissionConstant::CREATE_CATEGORY);
        $admin->givePermissionTo(PermissionConstant::EDIT_CATEGORY);
        $admin->givePermissionTo(PermissionConstant::REMOVE_CATEGORY);
        // product
        $admin->givePermissionTo(PermissionConstant::VIEW_PRODUCT);
        $admin->givePermissionTo(PermissionConstant::CREATE_PRODUCT);
        $admin->givePermissionTo(PermissionConstant::EDIT_PRODUCT);
        $admin->givePermissionTo(PermissionConstant::REMOVE_PRODUCT);
        // stock
        $admin->givePermissionTo(PermissionConstant::VIEW_STOCK);
        $admin->givePermissionTo(PermissionConstant::CREATE_STOCK);
        $admin->givePermissionTo(PermissionConstant::EDIT_STOCK);
        $admin->givePermissionTo(PermissionConstant::REMOVE_STOCK);
        // staff
        $admin->givePermissionTo(PermissionConstant::VIEW_STAFF);
        $admin->givePermissionTo(PermissionConstant::CREATE_STAFF);
        $admin->givePermissionTo(PermissionConstant::EDIT_STAFF);
        $admin->givePermissionTo(PermissionConstant::REMOVE_STAFF);
        // customer
        $admin->givePermissionTo(PermissionConstant::VIEW_CUSTOMER);
        $admin->givePermissionTo(PermissionConstant::EDIT_CUSTOMER);
        $admin->givePermissionTo(PermissionConstant::REMOVE_CUSTOMER);
        // note:: assign limited permissions to staff
        $staff->givePermissionTo(PermissionConstant::VIEW_PRODUCT);
        $staff->givePermissionTo(PermissionConstant::VIEW_STOCK);
        $staff->givePermissionTo(PermissionConstant::CREATE_STOCK);
        // note:: assign limited permissions to customer
        $customer->givePermissionTo(PermissionConstant::CREATE_CUSTOMER);
    }
}
