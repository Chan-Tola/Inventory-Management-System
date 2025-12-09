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
        // note: supplier permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_SUPPLIER, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::CREATE_SUPPLIER, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::EDIT_SUPPLIER, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::REMOVE_SUPPLIER, 'guard_name' => 'api']);
        // note: transaction permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_TRANSACTION, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::CREATE_TRANSACTION, 'guard_name' => 'api']);

        // note: sale report permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_SALE_REPORT, 'guard_name' => 'api']);

        // note: Top Sale  permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_TOP_SALE, 'guard_name' => 'api']);

        // note: order permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_ORDER, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::CREATE_ORDER, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::EDIT_ORDER, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::REMOVE_ORDER, 'guard_name' => 'api']);
        // note: order_items permissions
        Permission::firstOrCreate(['name' => PermissionConstant::VIEW_ORDER_ITEM, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::CREATE_ORDER_ITEM, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::EDIT_ORDER_ITEM, 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => PermissionConstant::REMOVE_ORDER_ITEM, 'guard_name' => 'api']);
    }
}
