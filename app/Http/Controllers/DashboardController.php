<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function fetchTodaysAppoint()
    {
        $data = DB::table('appointment')
            ->join('client', 'appointment.client_id', '=', 'client.id')
            ->select(
                'appointment.*',
                'client.name',
            )
            ->get();

        if ($data) {
            return response()->json(['success' => true, 'retrieved' => $data]);
        }

        return response()->json(['success' => false]);
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
