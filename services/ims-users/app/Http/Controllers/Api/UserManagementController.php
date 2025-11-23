<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Resources\UserResource;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $users = User::all();
            return response()->json([
                'message' => 'Users retrieved successfully',
                'data' => UserResource::collection($users)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        //
    }

    public function show($id): JsonResponse
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
                'error' =>  $e->getMessage()
            ], 500);
        }
    }

    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

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

    public function createStaffUser(StoreStaffRequest $request): JsonResponse
    {
        Log::info('Request data received for staff creation:', $request->all());
        Log::info('Request files:', $request->files->all());
        Log::info('Has profile file:', ['hasFile' => $request->hasFile(Staff::PROFILE_URL)]);
        try {
            DB::beginTransaction();

            // Create User
            $user = User::create([
                User::NAME => $request->{User::NAME},
                User::EMAIL => $request->{User::EMAIL},
                User::PASSWORD => Hash::make($request->{User::PASSWORD}),
                User::IS_ACTIVE => $request->{User::IS_ACTIVE} ?? true,
            ]);
            Log::info('User created successfully', ['user_id' => $user->id]);

            // Handle profile image upload to Cloudinary

            $profileData = null;
            if ($request->has(Staff::PROFILE_URL)) {
                Log::info('Attempting to process profile image...');
                $profileData = $this->handleProfileImageUpload($request);
                // If main method fails, try test method
                if (!$profileData) {
                    Log::warning('Main upload method failed, trying test method...');
                    $profileData = $this->testCloudinaryUpload($request);
                }
                if ($profileData) {
                    Log::info('Profile image processed successfully', $profileData);
                } else {
                    Log::warning('All profile image processing methods failed');
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
                Log::info('Profile URL set in staff data', ['url' => $profileData['secure_url']]);
            } else {
                Log::info('No profile URL to set in staff data');
            }

            $staff = Staff::create($staffData);
            Log::info('Staff created successfully', [
                'staff_id' => $staff->id,
                'has_profile_url' => !empty($staff->profile_url)
            ]);

            // Assign roles
            if ($request->has('roles') && !empty($request->roles)) {
                $user->syncRoles($request->roles);
                Log::info('Roles assigned', ['roles' => $request->roles]);
            } else {
                $user->assignRole('staff');
                Log::info('Default role assigned: staff');
            }

            DB::commit();

            $user->load(['staff', 'roles']);

            Log::info('Staff creation completed successfully', [
                'user_id' => $user->id,
                'staff_id' => $staff->id,
                'roles' => $user->getRoleNames()
            ]);

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

    private function handleProfileImageUpload($request): ?array
    {
        try {
            Log::info('handleProfileImageUpload called', [
                'has_profile_url' => $request->has(Staff::PROFILE_URL),
                'is_base64' => $this->isBase64Image($request->{Staff::PROFILE_URL})
            ]);

            if ($request->has(Staff::PROFILE_URL) && $this->isBase64Image($request->{Staff::PROFILE_URL})) {
                Log::info('Processing BASE64 upload for profile image');

                $base64Data = $request->{Staff::PROFILE_URL};

                Log::info('Base64 data length: ' . strlen($base64Data));

                // Upload base64 to Cloudinary with better error handling
                $result = cloudinary()->uploadApi()->upload($base64Data, [
                    'folder' => 'staff-profiles'
                ]);

                // ✅ ADD NULL CHECK for Cloudinary response
                if (!$result || !is_array($result)) {
                    Log::error('Cloudinary returned invalid response', ['response' => $result]);
                    return null;
                }

                // ✅ CHECK if required keys exist
                if (!isset($result['secure_url']) || !isset($result['public_id'])) {
                    Log::error('Cloudinary response missing required keys', [
                        'available_keys' => array_keys($result),
                        'response' => $result
                    ]);
                    return null;
                }

                Log::info('Base64 image uploaded to Cloudinary successfully', [
                    'public_id' => $result['public_id'],
                    'url' => $result['secure_url']
                ]);

                return [
                    'secure_url' => $result['secure_url'],
                    'public_id' => $result['public_id']
                ];
            }

            Log::info('No valid image data found to process');
            return null;
        } catch (\Exception $e) {
            Log::error('Profile image upload failed: ' . $e->getMessage());
            Log::error('Upload error trace: ' . $e->getTraceAsString());
            return null;
        }
    }

    private function testCloudinaryUpload($request): ?array
    {
        try {
            Log::info('Testing Cloudinary upload...');

            $base64Data = $request->{Staff::PROFILE_URL};

            // Test with a simple upload first
            $result = cloudinary()->uploadApi()->upload($base64Data);

            Log::info('Cloudinary test upload result:', [
                'success' => isset($result['secure_url']),
                'url' => $result['secure_url'] ?? 'NOT_SET',
                'public_id' => $result['public_id'] ?? 'NOT_SET'
            ]);

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
    private function isBase64Image(string $value): bool
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $value)) {
            return true;
        }

        return false;
    }


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
}
