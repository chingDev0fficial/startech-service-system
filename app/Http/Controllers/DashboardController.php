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
                    'service.status as status'
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
        Log::info("testing");

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
}
