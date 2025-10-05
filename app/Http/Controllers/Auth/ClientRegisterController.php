<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rules;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ClientRegisterController extends Controller
{
    public function create()
    {
        return Inertia::render('auth/client_register');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|',
            'phone' => 'required|string|max:15',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'client_status' => 'required|string|max:11'
        ]);

        $client = Client::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone,
            'password' => Hash::make($request->password),
            'client_status' => $request->client_status,
        ]);

        // Add client to session - Using Auth guard
        Auth::guard('client')->login($client);

        Log::info(Auth::guard('client')->user());

        // Or if you want to regenerate session (more secure)
        $request->session()->regenerate();

        return redirect()->intended(route('home', absolute: false));
    }
}
