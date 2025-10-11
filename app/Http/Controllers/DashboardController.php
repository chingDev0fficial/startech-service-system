<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function fetchTodaysAppoint()
    {
        try {
            $data = DB::table('appointment')
                ->join('client', 'appointment.client_id', '=', 'client.id')
                ->select(
                    'appointment.*',
                    'client.name',
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
}
