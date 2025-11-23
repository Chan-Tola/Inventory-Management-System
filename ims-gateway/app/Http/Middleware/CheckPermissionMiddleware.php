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
        // log::info("Permission Check Debug", [
        //     'request_method' => $request->method(),
        //     'request_url' => $request->fullUrl(),
        //     'required_permission' => $permission,
        //     'user_permissions_available' => $userPermissions,
        //     'has_permission' => in_array($permission, $userPermissions),
        //     'user_id' => $request->user_id ?? 'unknown'
        // ]);
        if (!in_array($permission, $userPermissions)) {
            // Log::warning('❌ Permission Denied', [
            //     'required_permission' => $permission,
            //     'user_permissions' => $userPermissions,
            //     'user_id' => $request->user_id
            // ]);

            return response()->json([
                'message' => 'You do not have the required permission.'
            ], 403);
        }
        // Log::info('✅ Permission Granted', [
        //     'permission' => $permission,
        //     'user_id' => $request->user_id
        // ]);
        return $next($request);
    }
}
