<?php

use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::get('/validate', [AuthController::class, 'validateToken'])->middleware('auth:api');
});

// Route::prefix('users')->group(function () {
//     Route::get('/', function () {
//         return response()->json([
//             'message' => 'API Users success testing.',
//             'data' => []
//         ]);
//     });
// });
