<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ClientController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'serviceLocation' => 'required|string|max:50',
            'date' => 'required|string',
            'time' => 'required|string|max:8',
            'serviceType' => 'required|string|max:50',
            'fullname' => 'required|string|max:255',
            'email' => 'required|string|max:255',
            'phone_no' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'item' => 'required|string|max:255',
            'description' => 'required|string',
            'warrantyReceipt' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // Handle file upload
        $warrantyReceiptPath = null;
        if (isset($validated['warrantyReceipt'])) {
            // Store the file in storage/app/public/warranty-receipts
            $warrantyReceiptPath = $validated['warrantyReceipt']->store('warranty-receipts', 'public');
            Log::info("File uploaded successfully: " . $warrantyReceiptPath);
        }

        // Create or find the client
        $client = DB::table('client')->insertGetId([
            'name' => $validated['fullname'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_no'],
            'address' => $validated['address'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Combine date and time for schedule_at
        $scheduleAt = Carbon::parse($validated['date'] . ' ' . $validated['time'])->format('Y-m-d H:i:s');

        // Create the appointment
        DB::table('appointment')->insert([
            'client_id' => $client,
            'item' => $validated['item'],
            'service_type' => $validated['serviceType'],
            'service_location' => $validated['serviceLocation'],
            'description' => $validated['description'],
            'schedule_at' => $scheduleAt,
            'warranty_receipt' => $warrantyReceiptPath, // Add this field
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('notification')->insert([
            'type' => 'client_req',
            'title' => 'New Appointment Request',
            'message' => "{$validated['fullname']} booked an appointment"
        ]);

        // Return success response for Inertia
        return back()->with('success', 'Appointment created successfully!');
    }
}
