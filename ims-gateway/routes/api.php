<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GatewayCategoryController;
use App\Http\Controllers\GatewayProductController;
use App\Http\Controllers\GatewayStockController;
use App\Http\Controllers\GatewaySupplierController;
use App\Http\Controllers\GatewayTransactionController;
use App\Http\Controllers\GatewayStaffController;
use App\Http\Controllers\GatewayCustomerController;
use App\Http\Controllers\GatewayOrderController;
use App\Http\Controllers\GatewayTopSellProductController;
use App\Http\Controllers\GetwaySaleReportProductController;

// note: publice route no need JWT token
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// note: protected routes need JWT token
Route::middleware(['jwt.auth'])->group(function () {
    // note: Auth logout
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // //note: /api/inventory/prodcuts
    Route::prefix('inventory')->group(function () {
        // note: Categories CRUD
        Route::get('/categories', [GatewayCategoryController::class, 'getCategories'])->middleware('permission:view category');
        // Route::get('/categories', [GatewayCategoryController::class, 'getCategories']);
        Route::get('/categories/{id}', [GatewayCategoryController::class, 'getCategory'])->middleware('permission:view category');
        Route::post('/categories', [GatewayCategoryController::class, 'createCategory'])->middleware('permission:create category');
        Route::put('/categories/{id}', [GatewayCategoryController::class, 'updateCategory'])->middleware('permission:edit category');
        Route::delete('/categories/{id}', [GatewayCategoryController::class, 'deleteCategory'])->middleware('permission:remove category');

        // note:  Products CRUD
        Route::get('/products', [GatewayProductController::class, 'getProducts'])->middleware('permission:view product');
        Route::get('/products/{id}', [GatewayProductController::class, 'getProduct'])->middleware('permission:view product');
        Route::post('/products', [GatewayProductController::class, 'createProduct'])->middleware('permission:create product');
        Route::put('/products/{id}', [GatewayProductController::class, 'updateProduct'])->middleware('permission:edit product');
        Route::delete('/products/{id}', [GatewayProductController::class, 'deleteProduct'])->middleware('permission:remove product');

        // note:  Stocks  CRUD
        Route::get('/stocks', [GatewayStockController::class, 'getStocks'])->middleware('permission:view stock');
        Route::get('/stocks/{id}', [GatewayStockController::class, 'getStock'])->middleware('permission:view stock');
        Route::post('/stocks', [GatewayStockController::class, 'createStock'])->middleware('permission:create stock');
        Route::put('/stocks/{id}', [GatewayStockController::class, 'updateStock'])->middleware('permission:edit stock');
        Route::delete('/stocks/{id}', [GatewayStockController::class, 'deleteStock'])->middleware('permission:remove stock');

        // note:  Suppliers  CRUD
        Route::get('/suppliers', [GatewaySupplierController::class, 'getSuppliers'])->middleware('permission:view supplier');
        Route::get('/suppliers/{id}', [GatewaySupplierController::class, 'getSupplier'])->middleware('permission:view supplier');
        Route::post('/suppliers', [GatewaySupplierController::class, 'createSupplier'])->middleware('permission:create supplier');
        Route::put('/suppliers/{id}', [GatewaySupplierController::class, 'updateSupplier'])->middleware('permission:edit supplier');
        Route::delete('/suppliers/{id}', [GatewaySupplierController::class, 'deleteSupplier'])->middleware('permission:remove supplier');
        // note: Transaction CRUD
        Route::get('/transactions', [GatewayTransactionController::class, 'getTransactions'])->middleware('permission:view transaction');
        Route::get('/transactions/{id}', [GatewayTransactionController::class, 'getTransaction'])->middleware('permission:view transaction');
        Route::post('/transactions', [GatewayTransactionController::class, 'createTransaction'])->middleware('permission:create transaction');
    });
    // note: Sale Report
    Route::get('/sale-report', [GetwaySaleReportProductController::class, 'getReport'])->middleware('permission:view report');
    Route::get('/top-selling', [GatewayTopSellProductController::class, 'getTopSellingProducts'])->middleware('permission:view topsell');

    //note: /api/users
    Route::prefix('users')->group(function () {
        // note:  Staff  CRUD
        Route::get('/staffs', [GatewayStaffController::class, 'getStaffUsers'])->middleware('permission:view staff');
        Route::get('/staffs/{id}', [GatewayStaffController::class, 'getStaffUser'])->middleware('permission:view staff');
        Route::post('/staffs', [GatewayStaffController::class, 'createStaffUser'])->middleware('permission:create staff');
        Route::put('/staffs/{id}', [GatewayStaffController::class, 'updateStaffUser'])->middleware('permission:edit staff');
        Route::delete('/staffs/{id}', [GatewayStaffController::class, 'deleteStaffUser'])->middleware('permission:remove staff');
        // note:  Customer  CRUD
        Route::get('/customers', [GatewayCustomerController::class, 'getCustomerUsers'])->middleware('permission:view customer');
        Route::get('/customers/{id}', [GatewayCustomerController::class, 'getCustomerUser'])->middleware('permission:view customer');
        Route::post('/customers', [GatewayCustomerController::class, 'createCustomerUser'])->middleware('permission:create customer');
        Route::put('/customers/{id}', [GatewayCustomerController::class, 'updateCustomerUser'])->middleware('permission:edit customer');
        Route::delete('/customers/{id}', [GatewayCustomerController::class, 'deleteCustomerUser'])->middleware('permission:remove customer');
    });
    //note: /api/orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [GatewayOrderController::class, 'getOrders'])->middleware('permission:view order');
        Route::post('/', [GatewayOrderController::class, 'createOrder'])->middleware('permission:create order');
        Route::get('/{id}', [GatewayOrderController::class, 'getOrder'])->middleware('permission:view order');
        Route::put('/{id}/status', [GatewayOrderController::class, 'updateOrderStatus'])->middleware('permission:edit order');
        Route::delete('/{id}', [GatewayOrderController::class, 'deleteOrder'])->middleware('permission:remove order');
    });
});
