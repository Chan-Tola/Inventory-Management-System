<?php

// use Illuminate\Http\Request;

use App\Http\Controllers\GatewayController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'IMS API Gateway is running']);
});

// note: publice route no need JWT token
Route::prefix('auth')->group(function () {
    Route::post('/login', [GatewayController::class, 'login']);
    // Route::post('register',[GatewayController:class, 'register']);
});

// note: protected routes need JWT token
Route::middleware(['jwt.auth'])->group(function () {
    // note: Auth logout
    Route::post('auth/logout', [GatewayController::class, 'logout']);

    // //note: /api/inventory/prodcuts
    Route::prefix('inventory')->group(function () {
        // note: Categories CRUD
        Route::get('/categories', [GatewayController::class, 'getCategories'])->middleware('permission:view category');
        Route::get('/categories/{id}', [GatewayController::class, 'getCategory'])->middleware('permission:view category');
        Route::post('/categories', [GatewayController::class, 'createCategory'])->middleware('permission:create category');
        Route::put('/categories/{id}', [GatewayController::class, 'updateCategory'])->middleware('permission:edit category');
        Route::delete('/categories/{id}', [GatewayController::class, 'deleteCategory'])->middleware('permission:remove category');

        // note:  Products CRUD
        Route::get('/products', [GatewayController::class, 'getProducts'])->middleware('permission:view product');
        Route::get('/products/{id}', [GatewayController::class, 'getProduct'])->middleware('permission:view product');
        Route::post('/products', [GatewayController::class, 'createProduct'])->middleware('permission:create product');
        Route::put('/products/{id}', [GatewayController::class, 'updateProduct'])->middleware('permission:edit product');
        Route::delete('/products/{id}', [GatewayController::class, 'deleteProduct'])->middleware('permission:remove product');

        // note:  Stocks  CRUD
        Route::get('/stocks', [GatewayController::class, 'getStocks'])->middleware('permission:view stock');
        Route::get('/stocks/{id}', [GatewayController::class, 'getStock'])->middleware('permission:view stock');
        Route::post('/stocks', [GatewayController::class, 'createStock'])->middleware('permission:create stock');
        Route::put('/stocks/{id}', [GatewayController::class, 'updateStock'])->middleware('permission:edit stock');
        Route::delete('/stocks/{id}', [GatewayController::class, 'deleteStock'])->middleware('permission:remove stock');

        // note:  Suppliers  CRUD
        Route::get('/suppliers', [GatewayController::class, 'getSuppliers'])->middleware('permission:view supplier');
        Route::get('/suppliers/{id}', [GatewayController::class, 'getSupplier'])->middleware('permission:view supplier');
        Route::post('/suppliers', [GatewayController::class, 'createSupplier'])->middleware('permission:create supplier');
        Route::put('/suppliers/{id}', [GatewayController::class, 'updateSupplier'])->middleware('permission:edit supplier');
        Route::delete('/suppliers/{id}', [GatewayController::class, 'deleteSupplier'])->middleware('permission:remove supplier');
        // note: Transaction CRUD
        Route::get('/transactions', [GatewayController::class, 'getTransactions'])->middleware('permission:view transaction');
        Route::get('/transactions/{id}', [GatewayController::class, 'getTransaction'])->middleware('permission:view transaction');
        Route::post('/transactions', [GatewayController::class, 'createTransaction'])->middleware('permission:create transaction');
    });
    //note: /api/users
    Route::prefix('users')->group(function () {

        // note:  Staff  CRUD
        Route::get('/staffs', [GatewayController::class, 'getStaffUsers'])->middleware('permission:view staff');
        Route::get('/staffs/{id}', [GatewayController::class, 'getStaffUser'])->middleware('permission:view staff');
        Route::post('/staffs', [GatewayController::class, 'createStaffUser'])->middleware('permission:create staff');
        Route::put('/staffs/{id}', [GatewayController::class, 'updateStaffUser'])->middleware('permission:edit staff');
        Route::delete('/staffs/{id}', [GatewayController::class, 'deleteStaffUser'])->middleware('permission:remove staff');

        // note:  Customer  CRUD
        Route::get('/customers', [GatewayController::class, 'getCustomerUsers'])->middleware('permission:view customer');
        Route::get('/customers/{id}', [GatewayController::class, 'getCustomerUser'])->middleware('permission:view customer');
        Route::post('/customers', [GatewayController::class, 'createCustomerUser'])->middleware('permission:create customer');
        Route::put('/customers/{id}', [GatewayController::class, 'updateCustomerUser'])->middleware('permission:edit customer');
        Route::delete('/customers/{id}', [GatewayController::class, 'deleteCustomerUser'])->middleware('permission:remove customer');
    });

    // ✅ Order Routes with appropriate permissions
    Route::prefix('orders')->group(function () {
        // Admin & Staff & Customer can view orders
        Route::get('/', [GatewayController::class, 'getOrders'])->middleware('permission:view order');

        // Admin & Staff & Customer can create orders
        Route::post('/', [GatewayController::class, 'createOrder'])->middleware('permission:create order');

        // Admin & Staff & Customer can view single order
        Route::get('/{id}', [GatewayController::class, 'getOrder'])->middleware('permission:view order');

        // Only Admin & Staff can update order status
        Route::put('/{id}/status', [GatewayController::class, 'updateOrderStatus'])->middleware('permission:edit order');

        // Only Admin can delete orders
        Route::delete('/{id}', [GatewayController::class, 'deleteOrder'])->middleware('permission:remove order');

        // Admin & Staff can view sales reports
        Route::get('/reports/sales', [GatewayController::class, 'getSalesReport'])->middleware('permission:view order');
    });
    // Health check route
    Route::get('/health/orders', [GatewayController::class, 'healthCheck']);
});
