<?php

// use Illuminate\Http\Request;

use App\Http\Controllers\GatewayController;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::get('/', function () {
    return response()->json(['message' => 'IMS API Gateway is running']);
});


//note: /api/inventory/prodcuts
Route::prefix('inventory')->group(function () {
    // note: Categories CRUD
    Route::get('/categories', [GatewayController::class, 'getCategories']);
    Route::get('/categories/{id}', [GatewayController::class, 'getCategory']);
    Route::post('/categories', [GatewayController::class, 'createCategory']);
    Route::put('/categories/{id}', [GatewayController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [GatewayController::class, 'deleteCategory']);

    // note:  Products CRUD
    Route::get('/products', [GatewayController::class, 'getProducts']);
    Route::get('/products/{id}', [GatewayController::class, 'getProduct']);
    Route::post('/products', [GatewayController::class, 'createProduct']);
    Route::put('/products/{id}', [GatewayController::class, 'updateProduct']);
    Route::delete('/products/{id}', [GatewayController::class, 'deleteProduct']);
});
//note: /api/orders
Route::prefix('orders')->group(function () {
    Route::get('/', [GatewayController::class, 'getOrders']); //note: → /orders

});
Route::prefix('users')->group(function () {
    Route::get('/', [GatewayController::class, 'getUsers']); //note: → /users
});


// Proxy to Inventory Servic - /api/inventory/
