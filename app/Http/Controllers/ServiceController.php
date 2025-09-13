<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;

class ServiceController extends Controller
{
    public function fetch()
    {
        $services = DB::table('service')
            ->join('appointment', 'service.appointment_id', '=', 'appointment.id')
            ->join('users', 'service.user_id', '=', 'users.id')
            ->select(
                'service.*',
                'appointment.item as appointment_item',
                'appointment.service_type as appointment_service_type',
                'appointment.client_name',
                'appointment.client_email',
                'appointment.client_phone',
                'users.name as technician_name',
                'users.email as technician_email'
            )
            ->get();

        return response()->json(['success' => true, 'retrieved' => $services]);
    }
}
