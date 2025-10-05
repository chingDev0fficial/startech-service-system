<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\HistoryController;
use Carbon\Carbon;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function store(Request $request)
    {
         $validated = $request->validate([
             'clientId' => 'required|integer',
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
             'clientStatus' => 'required|string|max:11',
         ]);

         // Handle file upload
         $warrantyReceiptPath = null;
         if (isset($validated['warrantyReceipt'])) {
             $warrantyReceiptPath = $validated['warrantyReceipt']->store('warranty-receipts', 'public');
             Log::info("File uploaded successfully: " . $warrantyReceiptPath);
         }

         // Handle client creation/retrieval based on status
         if ($validated['clientStatus'] === 'registered') {
             $client = $validated['clientId'];
         } else {
             // Create new client for guest
             $client = DB::table('client')->insertGetId([
                 'name' => $validated['fullname'],
                 'email' => $validated['email'],
                 'phone_number' => $validated['phone_no'],
                 'created_at' => now(),
                 'updated_at' => now(),
             ]);
         }

         // Combine date and time for schedule_at
         $scheduleAt = Carbon::parse($validated['date'] . ' ' . $validated['time'])->format('Y-m-d H:i:s');

         // Create the appointment
         DB::table('appointment')->insert([
             'client_id' => $client,
             'item' => $validated['item'],
             'service_type' => $validated['serviceType'],
             'service_location' => $validated['serviceLocation'],
             'description' => $validated['description'],
             'phone_number' => $validated['phone_no'],
             'address' => $validated['address'],
             'schedule_at' => $scheduleAt,
             'warranty_receipt' => $warrantyReceiptPath,
             'created_at' => now(),
             'updated_at' => now(),
         ]);

         DB::table('notification')->insert([
             'type' => 'client_req',
             'title' => 'New Appointment Request',
             'message' => "{$validated['fullname']} booked an appointment"
         ]);

         return back()->with('success', 'Appointment created successfully!');
    }

    public function createHist()
    {
        return Inertia::render('client-transactions');
    }

    public function fetchTransactions()
    {
        $histController = new HistoryController();
        $clientHist = $histController->fetch();
        Log::info("Data: " . $clientHist);
        return $clientHist;
    }
}
