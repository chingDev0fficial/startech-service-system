<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
                'appointment.status as appointment_status',
                'client.name as client_name',
                'client.email as client_email',
                'client.phone_number as client_phone',
                'users.name as technician_name',
                'users.email as technician_email'
            )
            ->get();

        if ($services) {
            return response()->json(['success' => true, 'retrieved' => $services]);
        }

        return response()->json(['success' => false]);
    }
}
