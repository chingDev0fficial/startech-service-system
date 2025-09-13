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
            ->select(
                'appointment.*',
                'client.name as client_name',
                'client.email as client_email',
                'client.phone_number as client_phone'
            )
            ->get();

        // Return to the requesting user
        return response()->json([
            'success' => true,
            'retrieved' => $appointments,
        ]);
    }

    public function accept(Request $request, $technician, $appointment)
    {

        $validated = $request->validate([
            /* 'appointmentId' => 'required|string', */
            /* 'userId' => 'required|string', */
            'warranty' => 'nullable|string',
            'warrantyStatus' => 'nullable|string',
        ]);

        DB::table('service')->insert([
            'appointment_id' => $appointment,
            'user_id' => $technician,
            'warranty' => $validated['warranty'],
            'warranty_status' => $validated['warrantyStatus'],
        ]);

        DB::table('appointment')
            ->where('id', $appointment)
            ->update(['mark_as' => 'accepted']);

        return response()->json(['message' => 'Appointment accepted successfully']);
    }

    public function decline(Request $request, $appointment)
    {
        DB::table('appointment')
            ->where('id', $appointment)
            ->update(['mark_as' => 'declined']);

        return response()->json(['message' => 'Appointment declined successfully']);
    }
}
