<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
// use App\Http\Requests\LoginRequest;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Exceptions\JWTException;

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
                return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
            }

            $user = Auth::user();
            // ✅ FRESH QUERY: Get user with Spatie relationships
            $userWithPermissions = \App\Models\User::with(['roles.permissions'])
                ->where('id', $user->id)
                ->first();
            // ✅ Get permissions and roles from Spatie
            $permissions = $userWithPermissions->getAllPermissions()->pluck('name')->toArray();
            $roles = $userWithPermissions->getRoleNames()->toArray();

            $token = JWTAuth::claims([
                'email' => $user->email,
                'name' => $user->name,
                'permissions' => $permissions,  // ✅ Now has actual permissions
                'roles' => $roles,              // ✅ Now has actual roles
                'staff_id' => $user->staff?->id,
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
            return response()->json(['success' => false, 'message' => 'Authentication failed'], 500);
        }
    }

    /**
     * Test endpoint to decode token
     */
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

            // Decode using middleware method
            $tokenParts = explode('.', $token);

            if (count($tokenParts) !== 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token format'
                ], 400);
            }

            $payload = json_decode(
                base64_decode(
                    strtr($tokenParts[1], '-_', '+/')
                ),
                true
            );

            // Also try JWTAuth decode
            $jwtDecoded = null;
            try {
                $jwtDecoded = JWTAuth::setToken($token)->getPayload()->toArray();
            } catch (\Exception $e) {
                // Ignore
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'manual_decode' => [
                        'payload_keys' => array_keys($payload),
                        'has_permissions' => isset($payload['permissions']),
                        'permissions' => $payload['permissions'] ?? 'NOT FOUND',
                        'roles' => $payload['roles'] ?? 'NOT FOUND',
                        'sub' => $payload['sub'] ?? 'NOT FOUND',
                    ],
                    'jwt_decode' => $jwtDecoded,
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


    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        try {
            $token = $request->bearerToken();
            Log::info('Logout request', ['token_prefix' => $token ? substr($token, 0, 20) . '...' : 'NULL']);
            // Invalidate the token
            auth('api')->logout();
            return response()->json([
                'success' => true,
                'message' => 'Logout successful',
                'data' => null
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
    /**
     * Clear cache for testing purposes (optional)
     */
    public function clearCache(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id'
        ]);

        $userId = $request->user_id;

        Cache::forget("user:{$userId}:permissions");
        Cache::forget("user:{$userId}:roles");

        Log::info('User cache cleared manually', ['user_id' => $userId]);

        return response()->json([
            'success' => true,
            'message' => 'Cache cleared successfully'
        ]);
    }

    public function register() {}
}
