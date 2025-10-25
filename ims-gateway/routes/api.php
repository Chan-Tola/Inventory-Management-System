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

    //note: /api/inventory/prodcuts
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

        // note:  stock  CRUD
        Route::get('/stocks', [GatewayController::class, 'getStocks'])->middleware('permission:view stock');
        Route::get('/stocks/{id}', [GatewayController::class, 'getStock'])->middleware('permission:view stock');
        Route::post('/stocks', [GatewayController::class, 'createStock'])->middleware('permission:create stock');
        Route::put('/stocks/{id}', [GatewayController::class, 'updateStock'])->middleware('permission:edit stock');
        Route::delete('/stocks/{id}', [GatewayController::class, 'deleteStock'])->middleware('permission:remove stock');
    });

    //note: /api/orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [GatewayController::class, 'getOrders']); //note: → /orders

    });
    //note: /api/users
    Route::prefix('users')->group(function () {
        Route::get('/', [GatewayController::class, 'getUsers']); //note: → /users
    });
});
