<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class MyAppointmentController extends Controller
{
    public function create()
    {
        return Inertia::render('my-appointments');
    }

    public function fetch()
    {
        $services = DB::table('service')
            ->join('appointment', 'service.appointment_id', '=', 'appointment.id')
            ->join('client', 'appointment.client_id', '=', 'client.id')
            ->join('users', 'service.user_id', '=', 'users.id')
            ->select(
                'service.*',
                'appointment.item as appointment_item_name',
                'appointment.service_type as appointment_service_type',
                'appointment.service_location as appointment_service_location',
                'appointment.schedule_at as appointment_date',
                'appointment.description as appointment_description',
                'client.name as client_name',
                'client.email as client_email',
                'client.phone_number as client_phone',
                'service.created_at as service_created_at',
                'service.updated_at as service_updated_at',
                'service.status as service_status',
            )
            ->get();

        if ($services) {
            return response()->json(['success' => true, 'retrieved' => $services]);
        }

        return response()->json(['success' => false]);
    }

    /**
     * Fetch the current availability status of the authenticated technician
     */
    public function fetchAvailability(Request $request)
    {
        try {
            $userId = Auth::id();

            Log::info("User ID $userId");

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $user = DB::table('users')
                ->select('status')
                ->where('id', $userId)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                // 'userId' => $userId,
                'status' => $user->status ?? 'available'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching availability status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch availability status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the availability status of the authenticated technician
     */
    public function updateAvailability(Request $request)
    {
        try {
            // Validate the incoming request
            $validated = $request->validate([
                'status' => ['required', Rule::in(['available', 'unavailable'])]
                // 'status' => 'required|string'
            ]);

            $userId = Auth::id();

            Log::info("User ID $userId");

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Update the availability status
            $updated = DB::table('users')
                ->where('id', $userId)
                ->update([
                    'status' => $validated['status'],
                    'updated_at' => now()
                ]);

            if ($updated) {
                // Log the status change
                Log::info("User ID {$userId} changed availability status to {$validated['status']}");

                // Optional: Broadcast event for real-time updates
                // event(new TechnicianAvailabilityChanged($userId, $validated['status']));

                return response()->json([
                    'success' => true,
                    'message' => 'Availability status updated successfully',
                    'status' => $validated['status']
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to update availability status'
            ], 500);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error updating availability status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update availability status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}