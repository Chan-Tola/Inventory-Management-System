<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{

    public function login(Request $request): JsonResponse
    {
        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $userId = Auth::id();

            // ✅ Cache permissions/roles only (most stable approach)
            $cacheKey = "user:{$userId}:auth_data";
            $authData = Cache::remember($cacheKey, 3600, function () use ($userId) {
                $user = User::with(['roles.permissions', 'staff'])
                    ->findOrFail($userId);

                return [
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                    'roles' => $user->getRoleNames()->toArray(),
                    'staff_id' => $user->staff?->id,
                ];
            });

            // ✅ Always fetch fresh user for response
            $user = User::with(['staff', 'customer'])->findOrFail($userId);

            $token = JWTAuth::claims([
                'sub' => $userId,
                'email' => $user->email,
                'name' => $user->name,
                'permissions' => $authData['permissions'],
                'roles' => $authData['roles'],
                'staff_id' => $authData['staff_id'],
            ])->attempt($credentials);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => JWTAuth::factory()->getTTL() * 60,
                    'user' => new UserResource($user),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Login failed', [
                'error' => $e->getMessage(),
                'email' => $request->email ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Authentication failed'
            ], 500);
        }
    }

    public function decodeToken(Request $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'No token provided'
                ], 401);
            }

            $tokenParts = explode('.', $token);
            if (count($tokenParts) !== 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token format'
                ], 400);
            }

            $payload = json_decode(
                base64_decode(strtr($tokenParts[1], '-_', '+/')),
                true
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'payload_keys' => array_keys($payload),
                    'has_permissions' => isset($payload['permissions']),
                    'permissions' => $payload['permissions'] ?? 'NOT FOUND',
                    'roles' => $payload['roles'] ?? 'NOT FOUND',
                    'sub' => $payload['sub'] ?? 'NOT FOUND',
                    'has_view_category' => isset($payload['permissions']) ?
                        in_array('view category', $payload['permissions']) : false
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Decode failed',
                'error' => $e->getMessage()
            ], 400);
        }
    }


    public function logout(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();

            // ✅ Clear user cache on logout
            if ($userId) {
                Cache::forget("user:{$userId}:auth_data");
            }

            auth('api')->logout();

            return response()->json([
                'success' => true,
                'message' => 'Logout successful',
                'data' => null
            ], 200);
        } catch (\Exception $e) {
            Log::error('Logout failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'data' => null
            ], 500);
        }
    }
    
    public function clearCache(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id'
        ]);

        $userId = $request->user_id;

        // ✅ Clear the correct cache key
        Cache::forget("user:{$userId}:auth_data");

        Log::info('User cache cleared manually', ['user_id' => $userId]);

        return response()->json([
            'success' => true,
            'message' => 'Cache cleared successfully'
        ]);
    }

    public function register() {}
}
