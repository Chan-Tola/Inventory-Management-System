<?php

namespace Database\Seeders;

use App\Constants\PermissionConstant;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // note: category permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_CATEGORY, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::CREATE_CATEGORY, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::EDIT_CATEGORY, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::REMOVE_CATEGORY, 'guard_name' => 'api']);
        // note: product permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_PRODUCT, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::CREATE_PRODUCT, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::EDIT_PRODUCT, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::REMOVE_PRODUCT, 'guard_name' => 'api']);
        // note: stock permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_STOCK, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::CREATE_STOCK, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::EDIT_STOCK, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::REMOVE_STOCK, 'guard_name' => 'api']);
        // note: staff permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_STAFF, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::CREATE_STAFF, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::EDIT_STAFF, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::REMOVE_STAFF, 'guard_name' => 'api']);
        // note: customer permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_CUSTOMER, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::CREATE_CUSTOMER, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::EDIT_CUSTOMER, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::REMOVE_CUSTOMER, 'guard_name' => 'api']);
    }
}
