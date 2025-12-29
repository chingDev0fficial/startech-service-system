<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\ServicePrice;

class DashboardController extends Controller
{
    public function fetchTodaysAppoint()
    {
        try {
            $data = DB::table('appointment')
                ->join('client', 'appointment.client_id', '=', 'client.id')
                ->join('service', 'appointment.id', '=', 'service.appointment_id')
                ->select(
                    'appointment.*',
                    'client.name',
                    'service.status as status',
                    'service.rating as rating',
                )
                ->get();

            // Log the data properly by converting to array/json
            Log::info("Appointments data:", $data->toArray());

            if ($data) {
                return response()->json(['success' => true, 'retrieved' => $data]);
            }

            return response()->json(['success' => false]);
        } catch (\Exception $e) {
            Log::error("Error fetching appointments: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function fetchTech()
    {
        $user = DB::table('users')->get();

        if ($user) {
            return response()->json(['success' => true, 'retrieved' => $user]);
        }

        return response()->json(['success' => false]);
    }
    
    public function updateServicePrice(Request $request)
    {

        $validated = $request->validate([
            'within' => 'required|numeric|min:0',
            'outside' => 'required|numeric|min:0',
        ]);

        $w_i = (int) $validated['within'];
        $w_o = (int) $validated['outside'];
        $prices = ServicePrice::first() ?? new ServicePrice();
        $prices->within = $w_i;
        $prices->outside = $w_o;
        $prices->save();

        return back()->with('success', 'Service prices updated successfully.');
    }

    public function getServicePrice()
    {
        try {
            $prices = ServicePrice::first();
            
            return response()->json([
                'success' => true,
                'within' => $prices ? $prices->within : 0,
                'outside' => $prices ? $prices->outside : 0
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching service prices: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'within' => 0,
                'outside' => 0,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function fetchAppointmentData($id)
    {
        try {
            $appointment = DB::table('appointment')
                ->join('client', 'appointment.client_id', '=', 'client.id')
                ->leftJoin('service', 'appointment.id', '=', 'service.appointment_id')
                ->leftJoin('users', 'service.user_id', '=', 'users.id')
                ->select(
                    'appointment.*',
                    'client.name',
                    'service.status',
                    'service.rating',
                    'users.name as technician_name',
                    'users.email as technician_email',
                    'users.id as technician_id'
                )
                ->where('appointment.id', $id)
                ->first();

            if (!$appointment) {
                return response()->json([
                    'success' => false, 
                    'error' => 'Appointment not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $appointment
            ]);
            
        } catch (\Exception $e) {
            Log::error("Error fetching appointment: " . $e->getMessage());
            return response()->json([
                'success' => false, 
                'error' => $e->getMessage()
            ], 500);
        }
    }
<<<<<<< HEAD
=======

    public function fetchRatings()
    {
        try {
            $ratings = DB::table("rating_comments")
                ->leftJoin("service", "rating_comments.appointment_id", "=", "service.appointment_id")
                ->leftJoin("appointment", "rating_comments.appointment_id", "=", "appointment.id")
                ->leftJoin("client", "appointment.client_id", "=", "client.id")
                ->whereNotNull("service.rating")
                ->select(
                    "rating_comments.*",
                    "service.status",
                    "service.rating",
                    "appointment.item",
                    "appointment.service_type",
                    "appointment.schedule_at",
                    "client.name as client_name"
                )
                ->get();

            return response()->json(['success' => true, 'data' => $ratings]);
        } catch ( \Exception $e ) {
            throw new \Exception("Failed to fetch ratings");
        }

        return response()->json(['success' => false]);
    }
>>>>>>> 1b4a70aecac778728e0f46c40b89351295f7f424
}
