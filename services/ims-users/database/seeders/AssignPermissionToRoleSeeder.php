<?php

namespace Database\Seeders;

use App\Constants\PermissionConstant;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AssignPermissionToRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = Role::where('name', 'admin')->first();
        $staff = Role::where('name', 'staff')->first();
        $customer = Role::where('name', 'customer')->first();

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
        // supplier
        $admin->givePermissionTo(PermissionConstant::VIEW_SUPPLIER);
        $admin->givePermissionTo(PermissionConstant::CREATE_SUPPLIER);
        $admin->givePermissionTo(PermissionConstant::EDIT_SUPPLIER);
        $admin->givePermissionTo(PermissionConstant::REMOVE_SUPPLIER);

        // staff
        $admin->givePermissionTo(PermissionConstant::VIEW_STAFF);
        $admin->givePermissionTo(PermissionConstant::CREATE_STAFF);
        $admin->givePermissionTo(PermissionConstant::EDIT_STAFF);
        $admin->givePermissionTo(PermissionConstant::REMOVE_STAFF);
        // customer
        $admin->givePermissionTo(PermissionConstant::VIEW_CUSTOMER);
        $admin->givePermissionTo(PermissionConstant::CREATE_CUSTOMER);
        $admin->givePermissionTo(PermissionConstant::EDIT_CUSTOMER);
        $admin->givePermissionTo(PermissionConstant::REMOVE_CUSTOMER);
        // transition
        $admin->givePermissionTo(PermissionConstant::VIEW_TRANSACTION);
        $admin->givePermissionTo(PermissionConstant::CREATE_TRANSACTION);

        // sale report
        $admin->givePermissionTo(PermissionConstant::VIEW_SALE_REPORT);

        // Top Sell 
        $admin->givePermissionTo(PermissionConstant::VIEW_TOP_SALE);

        // ✅ ORDER Permissions - Admin gets ALL
        $admin->givePermissionTo(PermissionConstant::VIEW_ORDER);
        $admin->givePermissionTo(PermissionConstant::CREATE_ORDER);
        $admin->givePermissionTo(PermissionConstant::EDIT_ORDER);
        $admin->givePermissionTo(PermissionConstant::REMOVE_ORDER);

        // ✅ ORDER ITEM Permissions - Admin gets ALL
        $admin->givePermissionTo(PermissionConstant::VIEW_ORDER_ITEM);
        $admin->givePermissionTo(PermissionConstant::CREATE_ORDER_ITEM);
        $admin->givePermissionTo(PermissionConstant::EDIT_ORDER_ITEM);
        $admin->givePermissionTo(PermissionConstant::REMOVE_ORDER_ITEM);

        // note:: assign limited permissions to staff
        $staff->givePermissionTo(PermissionConstant::VIEW_PRODUCT);
        $staff->givePermissionTo(PermissionConstant::VIEW_SUPPLIER);
        $staff->givePermissionTo(PermissionConstant::VIEW_STOCK);
        $staff->givePermissionTo(PermissionConstant::CREATE_STOCK);

        // ✅ ORDER Permissions - Staff can view and create orders
        $staff->givePermissionTo(PermissionConstant::VIEW_ORDER);
        $staff->givePermissionTo(PermissionConstant::CREATE_ORDER);
        $staff->givePermissionTo(PermissionConstant::EDIT_ORDER); // Can update order status

        // ✅ ORDER ITEM Permissions - Staff can manage order items
        $staff->givePermissionTo(PermissionConstant::VIEW_ORDER_ITEM);
        $staff->givePermissionTo(PermissionConstant::CREATE_ORDER_ITEM);
        $staff->givePermissionTo(PermissionConstant::EDIT_ORDER_ITEM);

        // note:: assign limited permissions to customer
        $customer->givePermissionTo(PermissionConstant::CREATE_CUSTOMER);
        $customer->givePermissionTo(PermissionConstant::EDIT_CUSTOMER);
        $customer->givePermissionTo(PermissionConstant::VIEW_PRODUCT);
        $customer->givePermissionTo(PermissionConstant::VIEW_STOCK);

        // ✅ ORDER Permissions - Customers can view their own orders and create orders
        $customer->givePermissionTo(PermissionConstant::VIEW_ORDER);
        $customer->givePermissionTo(PermissionConstant::CREATE_ORDER);

        // ✅ ORDER ITEM Permissions - Customers can view order items
        $customer->givePermissionTo(PermissionConstant::VIEW_ORDER_ITEM);
    }
}
