<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        if (!in_array($request->user()->role, $roles)) {
            // Redirect to appropriate dashboard based on role
            return $this->redirectBasedOnRole($request->user()->role);
        }

        return $next($request);
    }

    private function redirectBasedOnRole($role)
    {
        return match($role) {
            'super user' => redirect()->route('dashboard'),
            'staff' => redirect()->route('manage-appointments'),
            'technician' => redirect()->route('my-appointments'),
            default => redirect()->route('dashboard'),
        };
    }
}
