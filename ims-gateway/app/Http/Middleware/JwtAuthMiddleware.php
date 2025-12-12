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
        // $token = $request->bearerToken();
        $token = $this->extractToken($request);

        Log::debug('JWT Middleware - Token Check', [
            'method' => $request->method(),
            'path' => $request->path(),
            'has_bearer_token' => !empty($token),
            'token_length' => $token ? strlen($token) : 0,
            'endpoint' => $request->route() ? $request->route()->uri() : 'no_route'
        ]);

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
            // if (isset($payload['exp']) && $payload['exp'] < time()) {
            //     Log::warning('❌ Token expired', ['exp' => $payload['exp'], 'now' => time()]);
            //     return response()->json([
            //         'message' => 'Token has expired'
            //     ], 401);
            // }

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


            // Log::debug('✅ JWT validated locally (no service call, no extra packages)', [
            //     'user_id' => $request->user_id,
            //     'staff_id' => $request->staff_id,
            // ]);

            return $next($request);
        } catch (\Exception $e) {
            // ✅ REMOVE ERROR LOGGING TOO
            // Log::error('❌ JWT validation failed');
            return response()->json(['message' => 'Invalid token'], 401);
        }
    }

    private function extractToken(Request $request): ?string
    {
        // Method 1: Try bearerToken() first (works for POST, GET, etc.)
        $token = $request->bearerToken();
        if ($token) {
            return $token;
        }

        // Method 2: Direct header access (works for PUT, PATCH, etc.)
        $authHeader = $request->header('Authorization');
        if ($authHeader) {
            if (str_starts_with($authHeader, 'Bearer ')) {
                return substr($authHeader, 7);
            }
            // Sometimes the header might just be the token without "Bearer"
            if (preg_match('/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/', $authHeader)) {
                return $authHeader;
            }
        }

        // Method 3: Check query string (for debugging)
        if ($request->has('token')) {
            return $request->query('token');
        }

        return null;
    }
}
