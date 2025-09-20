<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InProgressController extends Controller
{
    public function create()
    {
        return Inertia::render('in-progress');
    }

    public function update(Request $request)
    {
        DB::table('appointment')
            ->where('id', $request->id)
            ->update([
                'status' => $request->status,
                'updated_at' => now() // or Carbon::now()
            ]);
        return response()->json(['message' => 'Appointment status updated to in-progress'], 200);
    }

}
