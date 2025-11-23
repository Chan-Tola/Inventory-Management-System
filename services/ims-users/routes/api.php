<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;


Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::get('/validate', [AuthController::class, 'validateToken'])->middleware('auth:api');
});

Route::prefix('users')->middleware('auth:api')->group(function () {

    // Staff-specific routes
    Route::get('/staffs', [UserManagementController::class, 'getStaffUsers']); // Only staff
    Route::get('/staffs/{id}', [UserManagementController::class, 'getStaffUser']);
    Route::post('/staffs', [UserManagementController::class, 'createStaffUser']);
    Route::put('/staffs/{id}', [UserManagementController::class, 'updateStaffUser']);
    Route::delete('/staffs/{id}', [UserManagementController::class, 'deleteStaffUser']);
    // In routes/web.php for testing
    Route::get('/test-cloudinary', function () {
        try {
            $result = cloudinary()->uploadApi()->upload(
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                ['folder' => 'test']
            );
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Customer-specific routes 
    Route::get('/customers', [UserManagementController::class, 'getCustomerUsers']); // Only custome
    Route::get('/customers/{id}', [UserManagementController::class, 'getCustomerUser']);
    Route::post('/customers', [UserManagementController::class, 'createCustomerUser']);
    Route::put('/customers/{id}', [UserManagementController::class, 'updateCustomerUser']);
    Route::delete('/customers/{id}', [UserManagementController::class, 'deleteCustomerUser']);

    // Gateway routes - get staff/customer by user ID
    Route::get('/{userId}/staff', [UserManagementController::class, 'getStaffByUser']);
    Route::get('/{userId}/customers', [UserManagementController::class, 'getCustomerByUser']);
});
