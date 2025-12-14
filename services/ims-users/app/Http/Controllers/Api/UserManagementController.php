<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Requests\UpdateStaffRequest;
use App\Http\Resources\UserResource;
use App\Models\Customer;
use App\Models\Staff;
use App\Models\User;
use App\Services\CacheService;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    private $cacheService;

    // Inject CacheService in constructor
    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Get customer names by customer IDs
     */
    public function getCustomersBatchInternal(Request $request)
    {
        try {
            Log::info('📥 Batch customer request received', [
                'all_params' => $request->all()
            ]);

            $request->validate([
                'customer_ids' => 'required|array|min:1',
                'customer_ids.*' => 'integer'
            ]);

            // Generate cache key for batch customers
            $cacheKey = $this->cacheService->generateKey('batch_customers', [
                'customer_ids' => $request->customer_ids
            ]);

            // Use cache with 30 minutes TTL
            $customers = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () use ($request) {
                    // Get customers with their user relationship
                    return Customer::with('user:id,name')
                        ->whereIn('id', $request->customer_ids)
                        ->get()
                        ->map(function ($customer) {
                            return [
                                'id' => $customer->id,
                                'user_id' => $customer->user_id,
                                'address' => $customer->address,
                                'name' => $customer->user->name ?? 'Unknown Customer',
                            ];
                        });
                },
                'customers' // Tag for easy clearing
            );

            Log::info('📤 Batch customers response', [
                'requested_count' => count($request->customer_ids),
                'found_count' => $customers->count()
            ]);

            return response()->json([
                'success' => true,
                'data' => $customers
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get batch customers', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get batch customers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get staff names by staff IDs
     */
    public function getStaffBatchInternal(Request $request)
    {
        try {
            Log::info('📥 Batch staff request received', [
                'all_params' => $request->all()
            ]);

            $request->validate([
                'staff_ids' => 'required|array|min:1',
                'staff_ids.*' => 'integer'
            ]);

            // Generate cache key for batch staff
            $cacheKey = $this->cacheService->generateKey('batch_staff', [
                'staff_ids' => $request->staff_ids
            ]);

            // Use cache with 30 minutes TTL
            $staff = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () use ($request) {
                    // Get staff with their user relationship
                    return Staff::with('user:id,name')
                        ->whereIn('id', $request->staff_ids)
                        ->get()
                        ->map(function ($staffMember) {
                            return [
                                'id' => $staffMember->id,
                                'staff_id' => $staffMember->user_id,
                                'name' => $staffMember->user->name ?? 'Unknown Staff'
                            ];
                        });
                },
                'staff' // Tag for easy clearing
            );

            Log::info('📤 Batch staff response', [
                'requested_count' => count($request->staff_ids),
                'found_count' => $staff->count()
            ]);

            return response()->json([
                'success' => true,
                'data' => $staff
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get batch staff', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get batch staff',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Staff Controller
    // index for staff
    public function getStaffUsers(Request $request): JsonResponse
    {
        try {
            // Generate cache key for staff users
            $cacheKey = $this->cacheService->generateKey('staff_users', $request->query());

            // Use cache with 30 minutes TTL
            $staffUsers = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () {
                    return User::whereHas('staff')->with(['staff', 'roles'])->get();
                },
                'staff' // Tag for easy clearing
            );

            if (!$staffUsers) {
                return response()->json(['message' => 'Staff users not found'], 404);
            }

            return response()->json([
                'message' => 'Staff users retrieved successfully',
                'data' => UserResource::collection($staffUsers)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve staff users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // show for staff
    public function getStaffUser($id): JsonResponse
    {
        try {
            // Generate cache key for specific staff user
            $cacheKey = $this->cacheService->generateKey("staff_user:{$id}");

            $user = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () use ($id) {
                    return User::with(['staff'])->find($id);
                },
                'staff'
            );

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            return response()->json([
                'message' => 'User retrieved successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve user.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // store for staff
    public function createStaffUser(StoreStaffRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Create User
            $user = User::create([
                User::NAME => $request->{User::NAME},
                User::EMAIL => $request->{User::EMAIL},
                User::PASSWORD => Hash::make($request->{User::PASSWORD}),
                User::IS_ACTIVE => $request->{User::IS_ACTIVE} ?? true,
            ]);

            // Handle profile image upload to Cloudinary
            $profileData = null;
            if ($request->has(Staff::PROFILE_URL)) {
                $profileData = $this->handleProfileImageUpload($request);
                if (!$profileData) {
                    $profileData = $this->testCloudinaryUpload($request);
                }
            }

            // Create Staff
            $staffCode = 'STF' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $staffData = [
                Staff::USER_ID => $user->id,
                Staff::STAFF_CODE => $staffCode,
                Staff::GENDER => $request->{Staff::GENDER},
                Staff::PHONE => $request->{Staff::PHONE},
                Staff::ADDRESS => $request->{Staff::ADDRESS},
                Staff::SALARY => $request->{Staff::SALARY},
                Staff::HIRE_DATE => $request->{Staff::HIRE_DATE},
            ];

            // Add profile data if available
            if ($profileData) {
                $staffData[Staff::PROFILE_URL] = $profileData['secure_url'];
                $staffData[Staff::IMAGE_PUBLIC_ID] = $profileData['public_id'] ?? null;
            }

            $staff = Staff::create($staffData);
            Log::info('Staff created successfully', [
                'staff_id' => $staff->id,
                'has_profile_url' => !empty($staff->profile_url)
            ]);

            // Assign roles
            if ($request->has('roles') && !empty($request->roles)) {
                $user->syncRoles($request->roles);
            } else {
                $user->assignRole('staff');
            }

            DB::commit();

            $user->load(['staff', 'roles']);

            // 🔥 Clear cache after creating staff
            $this->clearStaffCache();

            return response()->json([
                'success' => true,
                'message' => 'Staff user created successfully',
                'data' => new UserResource($user)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Staff creation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create staff user',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // update for staff
    public function updateStaffUser(UpdateStaffRequest $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validatedData = $request->validated();
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $staff = $user->staff;
            if (!$staff) {
                return response()->json(['message' => 'Staff record not found'], 404);
            }

            // Handle profile image upload to Cloudinary
            $profileData = null;
            if ($request->has(Staff::PROFILE_URL)) {
                // Delete old image BEFORE uploading new one
                if ($staff->image_public_id) {
                    $this->deleteCloudinaryImage($staff->image_public_id);
                }

                $profileData = $this->handleProfileImageUpload($request);
            }

            // Update the user (name)
            $user->update([
                User::NAME => $validatedData[User::NAME],
            ]);

            // Prepare staff update data
            $staffUpdateData = [
                Staff::PHONE => $validatedData[Staff::PHONE],
                Staff::ADDRESS => $validatedData[Staff::ADDRESS],
                Staff::SALARY => $validatedData[Staff::SALARY],
            ];

            // Only update profile URL if we have new image data
            if ($profileData) {
                $staffUpdateData[Staff::PROFILE_URL] = $profileData['secure_url'];
                $staffUpdateData[Staff::IMAGE_PUBLIC_ID] = $profileData['public_id'] ?? null;
            } else if ($request->has(Staff::PROFILE_URL) && empty($request->{Staff::PROFILE_URL})) {
                // If profile_url is explicitly set to empty, remove the image
                $staffUpdateData[Staff::PROFILE_URL] = null;
                $staffUpdateData[Staff::IMAGE_PUBLIC_ID] = null;
            }

            // Update the staff record
            $staff->update($staffUpdateData);

            DB::commit();

            // 🔥 Clear cache after updating staff
            $this->clearStaffCache($id);

            return response()->json([
                'success' => true,
                'message' => 'Staff updated successfully',
                'staff' => $staff->load('user')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Staff update failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update staff',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // delete for staff
    public function deleteStaffUser($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = User::find($id);
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $staff = $user->staff;
            if (!$staff) {
                return response()->json(['message' => 'Staff record not found'], 404);
            }

            // Delete image from Cloudinary
            if ($staff->image_public_id) {
                $this->deleteCloudinaryImage($staff->image_public_id);
            }

            // Delete records
            $staff->delete();
            $user->delete();

            DB::commit();

            // 🔥 Clear cache after deleting staff
            $this->clearStaffCache($id);

            return response()->json([
                'success' => true,
                'message' => 'Staff deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Staff deletion failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete staff',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // Customer Controller

    // index for customers
    public function getCustomerUsers(Request $request): JsonResponse
    {
        try {
            // Generate cache key for customer users
            $cacheKey = $this->cacheService->generateKey('customer_users', $request->query());

            // Use cache with 30 minutes TTL
            $customerUsers = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () {
                    return User::whereHas('customer')->with(['customer', 'roles'])->get();
                },
                'customers' // Tag for easy clearing
            );

            if (!$customerUsers) {
                return response()->json(['message' => 'Customer users not found'], 404);
            }

            return response()->json([
                'message' => 'Customer users retrieved successfully',
                'data' => UserResource::collection($customerUsers)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve customer users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // show for customer
    public function getCustomerUser($id): JsonResponse
    {
        try {
            // Generate cache key for specific customer user
            $cacheKey = $this->cacheService->generateKey("customer_user:{$id}");

            $user = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () use ($id) {
                    return User::with(['customer'])->find($id);
                },
                'customers'
            );

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            return response()->json([
                'message' => 'User retrieved successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve user.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // store for customer
    public function createCustomerUser(StoreCustomerRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Create User
            $user = User::create([
                User::NAME => $request->{User::NAME},
                User::EMAIL => $request->{User::EMAIL},
                User::PASSWORD => Hash::make($request->{User::PASSWORD}),
                User::IS_ACTIVE => $request->{User::IS_ACTIVE} ?? true,
            ]);

            // Create customer
            $customerCode = 'CUS' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $customerData = [
                Customer::USER_ID => $user->id,
                Customer::CUSTOMER_CODE => $customerCode,
                Customer::GENDER => $request->{Customer::GENDER},
                Customer::ADDRESS => $request->{Customer::ADDRESS},
            ];

            $customer = Customer::create($customerData);
            Log::info('Customer created successfully', ['customer_id' => $customer->id]);

            // Assign roles
            if ($request->has('roles') && !empty($request->roles)) {
                $user->syncRoles($request->roles);
            } else {
                $user->assignRole('customer');
            }

            DB::commit();

            $user->load(['customer', 'roles']);

            // 🔥 Clear cache after creating customer
            $this->clearCustomerCache();

            return response()->json([
                'success' => true,
                'message' => 'Customer user created successfully',
                'data' => new UserResource($user)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer creation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create Customer user',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // update for customer
    public function updateCustomerUser(UpdateCustomerRequest $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validatedData = $request->validated();
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $customer = $user->customer;
            if (!$customer) {
                return response()->json(['message' => 'Customer record not found'], 404);
            }

            // Update the user (name)
            $user->update([
                User::NAME => $validatedData[User::NAME],
            ]);

            // Prepare customer update data
            $customerUpdateData = [
                Customer::GENDER => $validatedData[Customer::GENDER],
                Customer::ADDRESS => $validatedData[Customer::ADDRESS],
            ];

            // Update the customer record
            $customer->update($customerUpdateData);

            DB::commit();

            // 🔥 Clear cache after updating customer
            $this->clearCustomerCache($id);

            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully',
                'staff' => $customer->load('user')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer update failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update customer',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // delete for customer
    public function deleteCustomerUser($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = User::find($id);
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $customer = $user->customer;
            if (!$customer) {
                return response()->json(['message' => 'Customer record not found'], 404);
            }

            // Delete records
            $customer->delete();
            $user->delete();

            DB::commit();

            // 🔥 Clear cache after deleting customer
            $this->clearCustomerCache($id);

            return response()->json([
                'success' => true,
                'message' => 'Customer deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer deletion failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete staff',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Retrieve staff information based on a given user ID.
     */
    public function getStaffByUser($userId): JsonResponse
    {
        try {
            // Generate cache key for staff by user
            $cacheKey = $this->cacheService->generateKey("staff_by_user:{$userId}");

            $result = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () use ($userId) {
                    $user = User::with('staff')->find($userId);
                    if (!$user) {
                        return [
                            'success' => false,
                            'message' => 'User not found'
                        ];
                    }

                    if (!$user->staff) {
                        return [
                            'success' => false,
                            'message' => 'Staff not found for this user'
                        ];
                    }

                    return [
                        'success' => true,
                        'message' => 'Staff retrieved successfully',
                        'data' => [
                            'staff_id' => $user->staff->id,
                            'staff' => $user->staff
                        ]
                    ];
                },
                'staff'
            );

            if (!$result['success']) {
                return response()->json($result, 404);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve staff',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear staff cache
     */
    private function clearStaffCache(?int $userId = null): void
    {
        try {
            // Clear specific staff user if ID provided
            if ($userId) {
                $this->cacheService->forget("staff_user:{$userId}");
                $this->cacheService->forget("staff_by_user:{$userId}");
            }

            // Clear all staff list caches
            $this->cacheService->clearByPrefix('staff_users:');
            $this->cacheService->clearByPrefix('batch_staff:');

            // Clear by tag
            $this->cacheService->clearByTag('staff');

            Log::info("🧹 Staff cache cleared", ['user_id' => $userId]);
        } catch (\Exception $e) {
            // Don't fail the operation if cache clearing fails
            Log::warning('Failed to clear staff cache', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Clear customer cache
     */
    private function clearCustomerCache(?int $userId = null): void
    {
        try {
            // Clear specific customer user if ID provided
            if ($userId) {
                $this->cacheService->forget("customer_user:{$userId}");
            }

            // Clear all customer list caches
            $this->cacheService->clearByPrefix('customer_users:');
            $this->cacheService->clearByPrefix('batch_customers:');

            // Clear by tag
            $this->cacheService->clearByTag('customers');

            Log::info("🧹 Customer cache cleared", ['user_id' => $userId]);
        } catch (\Exception $e) {
            // Don't fail the operation if cache clearing fails
            Log::warning('Failed to clear customer cache', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    // All private functions (unchanged from your original code)
    /**
     * Handle uploading a base64-encoded profile image to Cloudinary.
     */
    private function handleProfileImageUpload($request): ?array
    {
        try {
            if ($request->has(Staff::PROFILE_URL) && $this->isBase64Image($request->{Staff::PROFILE_URL})) {
                $base64Data = $request->{Staff::PROFILE_URL};

                $result = cloudinary()->uploadApi()->upload($base64Data, [
                    'folder' => 'staff-profiles'
                ]);

                if (!$result || !is_array($result)) {
                    return null;
                }

                if (!isset($result['secure_url']) || !isset($result['public_id'])) {
                    return null;
                }

                return [
                    'secure_url' => $result['secure_url'],
                    'public_id' => $result['public_id']
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Profile image upload failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Test Cloudinary upload directly for debugging purposes.
     */
    private function testCloudinaryUpload($request): ?array
    {
        try {
            $base64Data = $request->{Staff::PROFILE_URL};
            $result = cloudinary()->uploadApi()->upload($base64Data);

            if (isset($result['secure_url']) && isset($result['public_id'])) {
                return [
                    'secure_url' => $result['secure_url'],
                    'public_id' => $result['public_id']
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Cloudinary test upload failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Check if the given string is a valid base64-encoded image.
     */
    private function isBase64Image(string $value): bool
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $value)) {
            return true;
        }

        return false;
    }

    /**
     * Delete an image on Cloudinary using its public_id.
     */
    private function deleteCloudinaryImage($publicId): bool
    {
        if (!$publicId) {
            return false;
        }

        try {
            $result = cloudinary()->uploadApi()->destroy($publicId);
            Log::info('Cloudinary delete successful', ['result' => $result]);
            return true;
        } catch (\Exception $e) {
            Log::error('Cloudinary delete failed: ' . $e->getMessage(), [
                'public_id' => $publicId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
