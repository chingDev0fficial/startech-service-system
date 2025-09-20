<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class HistoryController extends Controller
{
    public function create($service_location)
    {
        return Inertia::render('manage-history', [
            'service_location' => $service_location
        ]);
    }

    public function fetch()
    {
        Log::info("Working");
        $services = DB::table('appointment')
            ->leftJoin('service', 'appointment.id', '=', 'service.appointment_id')
            ->leftJoin('client', 'appointment.client_id', '=', 'client.id')
            ->leftJoin('users', 'service.user_id', '=', 'users.id')
            ->select(
                'appointment.*',
                'appointment.id as appointment_id',
                'appointment.item as appointment_item_name',
                'appointment.service_type as appointment_service_type',
                'appointment.service_location as appointment_service_location',
                'appointment.schedule_at as appointment_date',
                'appointment.updated_at as completion_date',
                'appointment.description as appointment_description',
                'appointment.status as appointment_status',
                'client.name as client_name',
                'client.email as client_email',
                'client.phone_number as client_phone',
                'users.name as technician_name',
                'users.email as technician_email',
                'service.user_id'
            )
            ->get();

        if ($services) {
            return response()->json(['success' => true, 'retrieved' => $services]);
        }

        return response()->json(['success' => false]);
    }
}
