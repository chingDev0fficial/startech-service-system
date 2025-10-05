<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class ClientMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if client is authenticated using the 'client' guard
        if (!Auth::guard('client')->check()) {
            return redirect()->route('client.login');
        }

        // Check if the authenticated client has 'registered' status
        if (Auth::guard('client')->user()->client_status !== 'registered') {
            abort(403, 'Unauthorized access. Your account is not active.');
        }

        return $next($request);
    }
}
