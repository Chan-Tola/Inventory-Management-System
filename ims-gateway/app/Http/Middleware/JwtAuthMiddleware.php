<?php

namespace App\Http\Middleware;

use App\Services\AuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class JwtAuthMiddleware
{
    protected $authService;
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function handle(Request $request, Closure $next): Response
    {
        // Get token from Authorization header
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json([
                'message' => 'Authorization token not found',
            ], 401);
        }
        try {
            $response = $this->authService->validateToken($token);
            if ($response->successful()) {
                $userData = $response->json()['data'] ?? $response->json();
                $request->merge([
                    'user' => $userData,
                    'user_id' => $userData['id'] ?? null,
                    'user_permission' => $userData['permission'] ?? [],
                    'user_roles' => $userData['roles'] ?? [],
                ]);
                return $next($request);
            } else {
                return response()->json([
                    'message' => 'Invalid or expired token'
                ], 401);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Token validation failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
