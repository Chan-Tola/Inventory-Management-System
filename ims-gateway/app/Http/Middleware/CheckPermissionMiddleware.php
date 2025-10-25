<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class CheckPermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $userPermissions = $request->user_permission ?? [];
        if (!in_array($permission, $userPermissions)) {
            return response()->json([
                'message' => 'You do not have the required permission.'
            ], 403);
        }
        return $next($request);
    }
}
