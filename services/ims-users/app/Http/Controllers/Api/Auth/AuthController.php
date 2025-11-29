<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

    public function register() {}

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

    public function validateToken(Request $request): JsonResponse // ✅ Now using correct Request
    {
        try {
            Log::info('=== VALIDATE TOKEN START ===');

            // Check if user is authenticated using the JWT token
            if (!auth('api')->check()) {
                Log::warning('Token validation failed - user not authenticated');
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token'
                ], 401);
            }

            $user = auth('api')->user();
            Log::info('Token validation successful', ['user_id' => $user->id]);

            // Now UserResource should work!
            return response()->json([
                'success' => true,
                'data' => new UserResource($user)
            ], 200);
        } catch (\Exception $e) {
            Log::error('Token validation exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString() // Add trace to see detailed error
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Token validation failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
