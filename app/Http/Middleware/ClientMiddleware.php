<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClientMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return redirect()->route('client.login.store');
        }

        // Check if the authenticated user has 'client' role
        // Adjust this based on how you store roles in your database
        if (auth()->user()->role !== 'client') {
            // Redirect unauthorized users or abort
            abort(403, 'Unauthorized access. Client access only.');
            // Or redirect: return redirect()->route('home')->with('error', 'Unauthorized access');
        }

        return $next($request);
    }
}
