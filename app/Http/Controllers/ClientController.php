<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClientController extends Controller
{

    public function store(Request $request)
    {
        $validated = $request->validate([
            'serviceLocation'   => 'required|string|max:50',
            'date'              => 'required|string',  // Added missing comma
            'time'              => 'required|string|max:8',
            'serviceType'       => 'required|string|max:50',
            'fullname'          => 'required|string|max:255',
            'email'             => 'required|string|max:255',
            'phone_no'          => 'required|string|max:255',
            'address'           => 'required|string|max:255',
            'item'              => 'required|string|max:255',
            'description'       => 'required|string',
            /* 'mark_as'           => 'nullable|string', */
        ]);

        // First, create or find the client
        $client = DB::table('client')->insertGetId([
            'name'         => $validated['fullname'],
            'email'        => $validated['email'],
            'phone_number' => $validated['phone_no'],
            'address'      => $validated['address'],
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        // Combine date and time for schedule_at
        $scheduleAt = Carbon::parse($validated['date'] . ' ' . $validated['time'])->format('Y-m-d H:i:s');

        Log::info("Date & Time: " . $scheduleAt);
        // Then create the appointment
        DB::table('appointment')->insert([
            'client_id'         => $client,  // Use the created client ID
            'item'              => $validated['item'],
            'service_type'      => $validated['serviceType'],
            'service_location'  => $validated['serviceLocation'],
            'description'       => $validated['description'],
            'schedule_at'       => $scheduleAt,  // Combined date and time
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        /* return response()->json(['message' => 'Appointment created successfully']); */
    }
}
