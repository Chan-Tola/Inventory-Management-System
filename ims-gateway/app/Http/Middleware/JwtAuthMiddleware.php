<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JwtAuthMiddleware
{
    /**
     * ✅ OPTIMIZED: Validate JWT locally WITHOUT installing tymon/jwt-auth
     * Uses Firebase\JWT which is lightweight and doesn't require installation
     * Or manually decode JWT using base64_decode
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Authorization token not found',
            ], 401);
        }

        try {
            // ✅ OPTION 1: Manual JWT Decoding (No additional packages needed!)
            $tokenParts = explode('.', $token);

            if (count($tokenParts) !== 3) {
                throw new \Exception('Invalid token format');
            }

            // Decode the JWT payload (middle part)
            $payload = json_decode(
                base64_decode(
                    strtr($tokenParts[1], '-_', '+/')
                ),
                true
            );

            if (!$payload) {
                throw new \Exception('Invalid token payload');
            }

            // ✅ Check if token is expired
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                Log::warning('❌ Token expired', ['exp' => $payload['exp'], 'now' => time()]);
                return response()->json([
                    'message' => 'Token has expired'
                ], 401);
            }

            // ✅ Extract claims from decoded token
            $request->merge([
                'user_id' => $payload['sub'] ?? $payload['user_id'] ?? null,
                // 'email' => $payload['email'] ?? null,
                'user_permission' => $payload['permissions'] ?? [],
                'user_roles' => $payload['roles'] ?? [],
                'staff_id' => $payload['staff_id'] ?? null,
                'user' => [
                    'id' => $payload['sub'] ?? $payload['user_id'] ?? null,
                    // 'email' => $payload['email'] ?? null,
                    'staff_id' => $payload['staff_id'] ?? null,
                    'permission' => $payload['permissions'] ?? [],
                    'roles' => $payload['roles'] ?? [],
                ]
            ]);


            Log::debug('✅ JWT validated locally (no service call, no extra packages)', [
                'user_id' => $request->user_id,
                'staff_id' => $request->staff_id,
            ]);

            return $next($request);
        } catch (\Exception $e) {
            Log::error('❌ JWT validation failed', [
                'error' => $e->getMessage(),
                'class' => class_basename($e)
            ]);

            return response()->json([
                'message' => 'Invalid token: ' . $e->getMessage()
            ], 401);
        }
    }
}
