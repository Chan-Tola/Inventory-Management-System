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
    Route::get('/products', [GatewayController::class, 'getProducts']);
});
//note: /api/orders
Route::prefix('orders')->group(function () {
    Route::get('/', [GatewayController::class, 'getOrders']); //note: → /orders

});
Route::prefix('users')->group(function () {
    Route::get('/', [GatewayController::class, 'getUsers']); //note: → /users
});


// Proxy to Inventory Servic - /api/inventory/
