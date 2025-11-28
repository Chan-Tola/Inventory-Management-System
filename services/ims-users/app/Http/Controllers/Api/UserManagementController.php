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
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    // Staff Controller

    // index for staff
    public function getStaffUsers(): JsonResponse
    {
        try {
            $staffUsers = User::whereHas('staff')->with(['staff', 'roles'])->get();
            if (!$staffUsers) {
                return response()->json(['message' => 'User not found'], 404);
            }
            return response()->json([
                'message' => 'User retrieved successfully',
                'data' => UserResource::collection($staffUsers)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // show for staff
    public function getStaffUser($id): JsonResponse
    {
        try {
            $user = User::with(['staff'])->findOrFail($id);
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }
            return response()->json([
                'message' => 'User retrieved successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved user.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // store for staff
    public function createStaffUser(StoreStaffRequest $request): JsonResponse
    {
        // Log::info('Request data received for staff creation:', $request->all());
        // Log::info('Request files:', $request->files->all());
        // Log::info('Has profile file:', ['hasFile' => $request->hasFile(Staff::PROFILE_URL)]);
        try {
            DB::beginTransaction();

            // Create User
            $user = User::create([
                User::NAME => $request->{User::NAME},
                User::EMAIL => $request->{User::EMAIL},
                User::PASSWORD => Hash::make($request->{User::PASSWORD}),
                User::IS_ACTIVE => $request->{User::IS_ACTIVE} ?? true,
            ]);
            // Log::info('User created successfully', ['user_id' => $user->id]);

            // Handle profile image upload to Cloudinary

            $profileData = null;
            if ($request->has(Staff::PROFILE_URL)) {
                // Log::info('Attempting to process profile image...');
                $profileData = $this->handleProfileImageUpload($request);
                // If main method fails, try test method
                if (!$profileData) {
                    // Log::warning('Main upload method failed, trying test method...');
                    $profileData = $this->testCloudinaryUpload($request);
                }
                if ($profileData) {
                    // Log::info('Profile image processed successfully', $profileData);
                } else {
                    // Log::warning('All profile image processing methods failed');
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
                // Log::info('Profile URL set in staff data', ['url' => $profileData['secure_url']]);
            } else {
                // Log::info('No profile URL to set in staff data');
            }

            $staff = Staff::create($staffData);
            Log::info('Staff created successfully', [
                'staff_id' => $staff->id,
                'has_profile_url' => !empty($staff->profile_url)
            ]);

            // Assign roles
            if ($request->has('roles') && !empty($request->roles)) {
                $user->syncRoles($request->roles);
                // Log::info('Roles assigned', ['roles' => $request->roles]);
            } else {
                $user->assignRole('staff');
                // Log::info('Default role assigned: staff');
            }

            DB::commit();

            $user->load(['staff', 'roles']);

            // Log::info('Staff creation completed successfully', [
            //     'user_id' => $user->id,
            //     'staff_id' => $staff->id,
            //     'roles' => $user->getRoleNames()
            // ]);

            return response()->json([
                'success' => true,
                'message' => 'Staff user created successfully',
                'data' => new UserResource($user)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('Staff creation failed: ' . $e->getMessage());

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

            // Handle profile image upload to Cloudinary (using your existing function)
            $profileData = null;
            if ($request->has(Staff::PROFILE_URL)) {
                // Log::info('Attempting to process profile image for update...');

                // ✅ ADD THIS: Delete old image BEFORE uploading new one
                if ($staff->image_public_id) {
                    // Log::info('Deleting old staff image from Cloudinary', [
                    //     'public_id' => $staff->image_public_id
                    // ]);
                    $this->deleteCloudinaryImage($staff->image_public_id);
                }

                $profileData = $this->handleProfileImageUpload($request);

                if ($profileData) {
                    // Log::info('Profile image processed successfully for update', $profileData);
                } else {
                    // Log::warning('All profile image processing methods failed for update');
                }
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
                // Log::info('Profile URL updated in staff data', ['url' => $profileData['secure_url']]);
            } else if ($request->has(Staff::PROFILE_URL) && empty($request->{Staff::PROFILE_URL})) {
                // If profile_url is explicitly set to empty, remove the image
                $staffUpdateData[Staff::PROFILE_URL] = null;
                $staffUpdateData[Staff::IMAGE_PUBLIC_ID] = null;
                // Log::info('Profile image removed from staff data');
            }
            // If no profile_url in request, keep the existing image

            // Update the staff record
            $staff->update($staffUpdateData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Staff updated successfully',
                'staff' => $staff->load('user')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('Staff update failed: ' . $e->getMessage());

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

            return response()->json([
                'success' => true,
                'message' => 'Staff deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('Staff deletion failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete staff',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // Customer Controller

    // index for customers
    public function getCustomerUsers(): JsonResponse
    {
        try {
            $customerUsers = User::whereHas('customer')->with(['customer', 'roles'])->get();
            if (!$customerUsers) {
                return response()->json(['message' => 'User not found'], 404);
            }
            return response()->json([
                'message' => 'User retrieved successfully',
                'data' => UserResource::collection($customerUsers)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // show for customer
    public function getCustomerUser($id): JsonResponse
    {
        try {
            $user = User::with(['customer'])->findOrFail($id);
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }
            return response()->json([
                'message' => 'User retrieved successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved user.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // store for staff
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
            // Log::info('User created successfully', ['user_id' => $user->id]);

            // Debug: Check the model fillable
            // Log::info('Customer fillable fields:', (new Customer())->getFillable());

            // Create customer
            $customerCode = 'CUS' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $customerData = [
                Customer::USER_ID => $user->id,
                Customer::CUSTOMER_CODE => $customerCode,
                Customer::GENDER => $request->{Customer::GENDER},
                Customer::ADDRESS => $request->{Customer::ADDRESS},
            ];

            // Log::info('Attempting to create customer with data:', $customerData);

            $customer = Customer::create($customerData);
            // Log::info('Customer created successfully', ['customer_id' => $customer->id]);

            // Assign roles
            if ($request->has('roles') && !empty($request->roles)) {
                $customer->syncRoles($request->roles);
                // Log::info('Roles assigned', ['roles' => $request->roles]);
            } else {
                $user->assignRole('customer');
                // Log::info('Default role assigned: customer');
            }

            DB::commit();

            $user->load(['customer', 'roles']);

            return response()->json([
                'success' => true,
                'message' => 'Customer user created successfully',
                'data' => new UserResource($user)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('Customer creation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create Customer user',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }


    // update for staff
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
            // Prepare staff update data
            $customerUpdateData = [
                Customer::GENDER => $validatedData[Customer::GENDER],
                Customer::ADDRESS => $validatedData[Customer::ADDRESS],
            ];

            // Update the staff record
            $customer->update($customerUpdateData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully',
                'staff' => $customer->load('user')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('Customer update failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update customer',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // delete for staff
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

            return response()->json([
                'success' => true,
                'message' => 'Customer deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('Customer deletion failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete staff',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }


    /**
     * Retrieve staff information based on a given user ID.
     *
     * - Looks up a user by ID and loads the related staff record.
     * - Returns 404 if the user does not exist.
     * - Returns 404 if the user exists but has no related staff.
     * - If found, returns the staff data along with staff_id.
     * - Handles exceptions and returns a 500 error if something goes wrong.
     */
    public function getStaffByUser($userId): JsonResponse  // Change $staffId to $userId
    {
        try {
            $user = User::with('staff')->find($userId);  // Find by user ID
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            if (!$user->staff) {
                return response()->json([
                    'success' => false,
                    'message' => 'Staff not found for this user'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Staff retrieved successfully',
                'data' => [
                    'staff_id' => $user->staff->id,
                    'staff' => $user->staff
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve staff',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // All private function 
    /**
     * Handle uploading a base64-encoded profile image to Cloudinary.
     * - Checks if the request contains a valid base64 image.
     * - Uploads it to Cloudinary under 'staff-profiles' folder.
     * - Validates Cloudinary response and returns secure_url + public_id.
     * - Returns null if upload fails or data is invalid.
     */
    private function handleProfileImageUpload($request): ?array
    {
        try {
            // Log::info('handleProfileImageUpload called', [
            //     'has_profile_url' => $request->has(Staff::PROFILE_URL),
            //     'is_base64' => $this->isBase64Image($request->{Staff::PROFILE_URL})
            // ]);

            if ($request->has(Staff::PROFILE_URL) && $this->isBase64Image($request->{Staff::PROFILE_URL})) {
                // Log::info('Processing BASE64 upload for profile image');

                $base64Data = $request->{Staff::PROFILE_URL};

                // Log::info('Base64 data length: ' . strlen($base64Data));

                // Upload base64 to Cloudinary with better error handling
                $result = cloudinary()->uploadApi()->upload($base64Data, [
                    'folder' => 'staff-profiles'
                ]);

                // ✅ ADD NULL CHECK for Cloudinary response
                if (!$result || !is_array($result)) {
                    // Log::error('Cloudinary returned invalid response', ['response' => $result]);
                    return null;
                }

                // ✅ CHECK if required keys exist
                if (!isset($result['secure_url']) || !isset($result['public_id'])) {
                    // Log::error('Cloudinary response missing required keys', [
                    //     'available_keys' => array_keys($result),
                    //     'response' => $result
                    // ]);
                    return null;
                }

                // Log::info('Base64 image uploaded to Cloudinary successfully', [
                //     'public_id' => $result['public_id'],
                //     'url' => $result['secure_url']
                // ]);

                return [
                    'secure_url' => $result['secure_url'],
                    'public_id' => $result['public_id']
                ];
            }

            // Log::info('No valid image data found to process');
            return null;
        } catch (\Exception $e) {
            // Log::error('Profile image upload failed: ' . $e->getMessage());
            // Log::error('Upload error trace: ' . $e->getTraceAsString());
            return null;
        }
    }

    /**
     * Test Cloudinary upload directly for debugging purposes.
     * - Attempts to upload the base64 image without extra validation.
     * - Logs success, URL, and public_id.
     * - Returns secure_url + public_id if successful.
     * - Returns null on failure.
     */
    private function testCloudinaryUpload($request): ?array
    {
        try {
            // Log::info('Testing Cloudinary upload...');

            $base64Data = $request->{Staff::PROFILE_URL};

            // Test with a simple upload first
            $result = cloudinary()->uploadApi()->upload($base64Data);

            // Log::info('Cloudinary test upload result:', [
            //     'success' => isset($result['secure_url']),
            //     'url' => $result['secure_url'] ?? 'NOT_SET',
            //     'public_id' => $result['public_id'] ?? 'NOT_SET'
            // ]);

            if (isset($result['secure_url']) && isset($result['public_id'])) {
                return [
                    'secure_url' => $result['secure_url'],
                    'public_id' => $result['public_id']
                ];
            }

            return null;
        } catch (\Exception $e) {
            // Log::error('Cloudinary test upload failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Check if the given string is a valid base64-encoded image.
     * - Matches `data:image/...;base64,`
     * - Returns true for valid base64 image format; otherwise false.
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
     * - Logs deletion attempt.
     * - Calls Cloudinary destroy API.
     * - Returns true if deletion succeeds, false if it fails or public_id is missing.
     */
    private function deleteCloudinaryImage($publicId): bool
    {
        if (!$publicId) {
            return false;
        }

        try {
            // Log::info('Deleting Cloudinary image', ['public_id' => $publicId]);

            $result = cloudinary()->uploadApi()->destroy($publicId);

            Log::info('Cloudinary delete successful', ['result' => $result]);
            return true;
        } catch (\Exception $e) {
            // Log::error('Cloudinary delete failed: ' . $e->getMessage(), [
            //     'public_id' => $publicId,
            //     'error' => $e->getMessage()
            // ]);
            return false;
        }
    }
}
