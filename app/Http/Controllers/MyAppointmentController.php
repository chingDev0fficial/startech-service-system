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

    /**
     * Transfer appointment to another technician
     */
    public function transfer(Request $request)
    {
        try {
            $validated = $request->validate([
                'appointmentId' => 'required|integer|exists:service,id'
            ]);

            $serviceId = $validated['appointmentId'];
            $currentUserId = Auth::id();

            if (!$currentUserId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get the service record to retrieve appointment_id, warranty info
            $service = DB::table('service')
                ->where('id', $serviceId)
                ->where('user_id', $currentUserId)
                ->first();

            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service not found or you are not assigned to this appointment'
                ], 404);
            }

            $appointmentId = $service->appointment_id;
            $warranty = $service->warranty;
            $warrantyStatus = $service->warranty_status;

            DB::beginTransaction();

            try {
                // Delete the current service record
                DB::table('service')
                    ->where('id', $serviceId)
                    ->delete();

                // Remove current technician from queues
                DB::table('queues_tech')
                    ->where('technician_id', $currentUserId)
                    ->delete();

                // Set current technician to available
                DB::table('users')
                    ->where('id', $currentUserId)
                    ->update([
                        'status' => 'available',
                        'updated_at' => now()
                    ]);

                // Get only available technicians (excluding current technician)
                $availableTechnicians = DB::table('users')
                    ->where('role', 'technician')
                    ->where('status', 'available')
                    ->where('id', '!=', $currentUserId)
                    ->get();

                if ($availableTechnicians->isEmpty()) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'No available technicians at the moment. Please try again later.'
                    ], 400);
                }

                // Try to assign to a technician without queue
                $assigned = false;
                foreach ($availableTechnicians as $tech) {
                    $inQueues = DB::table('queues_tech')
                        ->where('technician_id', $tech->id)
                        ->exists();

                    if (!$inQueues) {
                        DB::table('queues_tech')->insert([
                            'technician_id' => $tech->id,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        DB::table('service')->insert([
                            'appointment_id' => $appointmentId,
                            'user_id' => $tech->id,
                            'warranty' => $warranty,
                            'warranty_status' => $warrantyStatus,
                            'status' => 'pending',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        $assigned = true;
                        break;
                    }
                }

                // If all available technicians have queues, clear queues and reassign
                if (!$assigned) {
                    DB::table('queues_tech')->delete();

                    // Assign to first available technician
                    $tech = $availableTechnicians->first();
                    
                    DB::table('queues_tech')->insert([
                        'technician_id' => $tech->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('service')->insert([
                        'appointment_id' => $appointmentId,
                        'user_id' => $tech->id,
                        'warranty' => $warranty,
                        'warranty_status' => $warrantyStatus,
                        'status' => 'pending',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::commit();

                Log::info("Appointment {$appointmentId} transferred from technician {$currentUserId}");

                return response()->json([
                    'success' => true,
                    'message' => 'Appointment transferred successfully!'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error transferring appointment: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to transfer appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a note from technician to client about an appointment
     */
    public function sendNote(Request $request)
    {
        try {
            $validated = $request->validate([
                'appointmentId' => 'required|integer|exists:service,id',
                'note' => 'required|string|max:1000'
            ]);

            $serviceId = $validated['appointmentId'];
            $noteText = $validated['note'];
            $technicianId = Auth::id();

            if (!$technicianId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get service details with appointment and client information
            $serviceDetails = DB::table('service')
                ->join('appointment', 'service.appointment_id', '=', 'appointment.id')
                ->join('client', 'appointment.client_id', '=', 'client.id')
                ->join('users', 'service.user_id', '=', 'users.id')
                ->where('service.id', $serviceId)
                ->where('service.user_id', $technicianId)
                ->select(
                    'service.id as service_id',
                    'service.appointment_id',
                    'appointment.item',
                    'appointment.service_type',
                    'client.name as client_name',
                    'client.email as client_email',
                    'users.name as technician_name'
                )
                ->first();

            if (!$serviceDetails) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service not found or you are not assigned to this appointment'
                ], 404);
            }

            DB::beginTransaction();

            try {
                // Update service record with the note
                DB::table('service')
                    ->where('id', $serviceId)
                    ->update([
                        'technician_note' => $noteText,
                        'note_sent_at' => now(),
                        'updated_at' => now()
                    ]);

                // Create notification for client, staff, and super users
                // Truncate note if too long for notification preview
                $notePreview = strlen($noteText) > 100 ? substr($noteText, 0, 100) . '...' : $noteText;
                $notificationMessage = "{$serviceDetails->technician_name} sent a note to {$serviceDetails->client_name}: \"{$notePreview}\"";

                DB::table('notification')->insert([
                    'type' => 'technician_note',
                    'title' => 'Technician Note Added',
                    'message' => $notificationMessage,
                    'status' => 'unread',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                DB::commit();

                Log::info("Technician {$technicianId} sent note for service {$serviceId}");

                return response()->json([
                    'success' => true,
                    'message' => 'Note sent successfully! Client, staff, and admins have been notified.'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error sending note: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send note',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}