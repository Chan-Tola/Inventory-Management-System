<?php

namespace App\Constants;

class PermissionConstant
{
    // Category Permissions
    public const VIEW_CATEGORY = 'view category';
    public const CREATE_CATEGORY = 'create category';
    public const EDIT_CATEGORY = 'edit category';
    public const REMOVE_CATEGORY = 'remove category';

    // Product Permissions
    public const VIEW_PRODUCT = 'view product';
    public const CREATE_PRODUCT = 'create product';
    public const EDIT_PRODUCT = 'edit product';
    public const REMOVE_PRODUCT = 'remove product';

    // Stock Permissions
    public const VIEW_STOCK = 'view stock';
    public const CREATE_STOCK = 'create stock';
    public const EDIT_STOCK = 'edit stock';
    public const REMOVE_STOCK = 'remove stock';

    // Product Permissions
    public const VIEW_STAFF = 'view staff';
    public const CREATE_STAFF = 'create staff';
    public const EDIT_STAFF = 'edit staff';
    public const REMOVE_STAFF = 'remove staff';

    // Customer Permissions
    public const VIEW_CUSTOMER = 'view customer';
    public const CREATE_CUSTOMER = 'create customer';
    public const EDIT_CUSTOMER = 'edit customer';
    public const REMOVE_CUSTOMER = 'remove customer';

    // Stock Permissions
    public const VIEW_SUPPLIER = 'view supplier';
    public const CREATE_SUPPLIER = 'create supplier';
    public const EDIT_SUPPLIER = 'edit supplier';
    public const REMOVE_SUPPLIER = 'remove supplier';

    // Transition Permissions
    public const VIEW_TRANSACTION = 'view transaction';
    public const CREATE_TRANSACTION = 'create transaction';

    // Sale Report Permissions
    public const VIEW_SALE_REPORT = 'view report';

    // Top Sale  Permissions
    public const VIEW_TOP_SALE = 'view topsell';


    // ✅ ORDER Permissions
    public const VIEW_ORDER = 'view order';
    public const CREATE_ORDER = 'create order';
    public const EDIT_ORDER = 'edit order';
    public const REMOVE_ORDER = 'remove order';

    // ✅ ORDER ITEM Permissions
    public const VIEW_ORDER_ITEM = 'view order item';
    public const CREATE_ORDER_ITEM = 'create order item';
    public const EDIT_ORDER_ITEM = 'edit order item';
    public const REMOVE_ORDER_ITEM = 'remove order item';
}
