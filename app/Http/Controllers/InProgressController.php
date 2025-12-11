<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Notification;

class InProgressController extends Controller
{
    public function create()
    {
        return Inertia::render('in-progress');
    }

    public function update(Request $request)
    {
        DB::table('appointment')
            ->where('id', $request->id)
            ->update([
                'price' => $request->price,
                'updated_at' => now() // or Carbon::now()
            ]);

        $serviceUpdateData = [
            'status' => $request->status,
            'updated_at' => now() // or Carbon::now()
        ];

        // Add technician note to update if it exists
        if ($request->has('note') && !empty($request->note)) {
            $serviceUpdateData['technician_note'] = $request->note;
        }

        DB::table('service')
            ->where('appointment_id', $request->id)
            ->update($serviceUpdateData);

        DB::table('users')
            ->where('id', $request->currentUserId)
            ->update([
                'status' => $request->status == 'in-progress' ? 'unavailable' :
                        ($request->status == 'completed' ? 'available' : null)
            ]);

        // Create notification for admin when price is 0 and there's a note
        if ($request->has('notifyAdmin') && $request->notifyAdmin && $request->price == 0) {
            // Get appointment details for the notification
            $appointment = DB::table('appointment')
                ->join('client', 'appointment.client_id', '=', 'client.id')
                ->where('appointment.id', $request->id)
                ->select('appointment.*', 'client.name as client_name')
                ->first();

            if ($appointment) {
                // Get technician name
                $technician = DB::table('users')
                    ->where('id', $request->currentUserId)
                    ->first();

                Notification::create([
                    'appointment_id' => $request->id,
                    'client_id' => $appointment->client_id,
                    'type' => 'zero_price_note',
                    'title' => 'Technician Note - Zero Price Appointment',
                    'message' => sprintf(
                        'Technician %s completed appointment for %s with $0 price. Note: %s',
                        $technician->name ?? 'Unknown',
                        $appointment->client_name,
                        $request->note
                    ),
                    'status' => 'unseen',
                ]);
            }
        }

        return response()->json(['message' => 'Appointment status updated to in-progress'], 200);
    }

}
