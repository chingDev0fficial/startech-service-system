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
                'appointment.updated_at as completion_date',
                'appointment.description as appointment_description',
                'client.name as client_name',
                'client.email as client_email',
                'client.phone_number as client_phone',
                'service.created_at as service_created_at',
                'service.status as service_status',
            )
            ->get();

        if ($services) {
            return response()->json(['success' => true, 'retrieved' => $services]);
        }

        return response()->json(['success' => false]);
    }
}
