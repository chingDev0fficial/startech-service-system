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
        try {
            // Validate that if price is 0, a note must be provided
            if ($request->price == 0 && (!$request->has('note') || empty(trim($request->note)))) {
                return response()->json([
                    'success' => false, 
                    'message' => 'A technician note is required when the price is $0'
                ], 422);
            }

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

            // Notify admin about appointment status update
            $appointment = DB::table('appointment')
                ->join('client', 'appointment.client_id', '=', 'client.id')
                ->where('appointment.id', $request->id)
                ->select('appointment.*', 'client.name as client_name')
                ->first();

            if ($appointment) {
                $technician = DB::table('users')
                    ->where('id', $request->currentUserId)
                    ->first();

                $notificationType = 'appointment_status_update';
                $notificationTitle = 'Appointment Status Updated';
                $notificationMessage = sprintf(
                    'Technician %s updated appointment for %s to status: %s. Price: $%s',
                    $technician->name ?? 'Unknown',
                    $appointment->client_name,
                    ucfirst(str_replace('-', ' ', $request->status)),
                    number_format($request->price, 2)
                );

                // Add note to message if provided
                if ($request->has('note') && !empty($request->note)) {
                    $notificationMessage .= '. Note: ' . $request->note;
                }

                // Special case for zero price appointments with notes
                if ($request->has('notifyAdmin') && $request->notifyAdmin && $request->price == 0) {
                    $notificationType = 'zero_price_note';
                    $notificationTitle = 'Technician Note - Zero Price Appointment';
                }

                Notification::create([
                    'type' => $notificationType,
                    'title' => $notificationTitle,
                    'message' => $notificationMessage,
                    'status' => 'unseen',
                ]);
            }

            return response()->json(['success' => true, 'message' => 'Appointment status updated successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error updating appointment: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update appointment'], 500);
        }
    }

}
