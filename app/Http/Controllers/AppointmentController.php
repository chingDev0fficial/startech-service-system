<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Appointment;

class AppointmentController extends Controller
{
    public function create(): Response {
        return Inertia::render('manage-appointments');
    }

    public function fetch()
    {
        // Get appointments
        $appointments = DB::table('appointment')
            ->join('client', 'appointment.client_id', '=', 'client.id')
            ->leftJoin('service', 'appointment.id', '=', 'service.appointment_id')
            ->select(
                'appointment.*',
                'client.name as client_name',
                'client.email as client_email',
                'client.phone_number as client_phone',
                DB::raw('COALESCE(service.status, "unknown") as status'),
            )
            ->get();

        // Return to the requesting user
        return response()->json([
            'success' => true,
            'retrieved' => $appointments,
        ]);
    }

    public function accept(Request $request, $appointment)
    {
        $validated = $request->validate([
            'warranty' => 'nullable|string',
            'warrantyStatus' => 'nullable|string|max:10',
        ]);

        // Get only available technicians
        $availableTechnicians = DB::table('users')
            ->where('role', 'technician')
            ->where('status', 'available')
            ->get();

        if ($availableTechnicians->isEmpty()) {
            return back()->with([
                'error' => 'No available technicians at the moment. Please try again later.'
            ]);
        }

        // Try to assign to a technician without queue
        foreach ($availableTechnicians as $tech) {
            $inQueues = DB::table('queues_tech')
                ->where('technician_id', $tech->id)
                ->exists();

            if (!$inQueues) {
                DB::transaction(function () use ($tech, $appointment, $validated) {
                    DB::table('queues_tech')->insert([
                        'technician_id' => $tech->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('service')->insert([
                        'appointment_id' => $appointment,
                        'user_id' => $tech->id,
                        'warranty' => $validated['warranty'],
                        'warranty_status' => $validated['warrantyStatus'],
                        'status' => 'pending',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('appointment')
                        ->where('id', $appointment)
                        ->update([
                            'mark_as' => 'accepted',
                            'updated_at' => now(),
                        ]);
                });

                return back()->with('success', 'Appointment accepted and assigned to technician successfully!');
            }
        }

        // If all available technicians have queues, clear queues and reassign
        DB::table('queues_tech')->delete();

        // Assign to first available technician
        $tech = $availableTechnicians->first();
        
        DB::transaction(function () use ($tech, $appointment, $validated) {
            DB::table('queues_tech')->insert([
                'technician_id' => $tech->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('service')->insert([
                'appointment_id' => $appointment,
                'user_id' => $tech->id,
                'warranty' => $validated['warranty'],
                'warranty_status' => $validated['warrantyStatus'],
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('appointment')
                ->where('id', $appointment)
                ->update([
                    'mark_as' => 'accepted',
                    'updated_at' => now(),
                ]);
        });

        return back()->with('success', 'Appointment accepted successfully!');
    }

    public function decline(Request $request, $appointment)
    {
        DB::table('appointment')
            ->where('id', $appointment)
            ->update([
                'mark_as' => 'declined',
                'updated_at' => now(),
            ]);

        return response()->json(['message' => 'Appointment declined successfully']);
    }
}