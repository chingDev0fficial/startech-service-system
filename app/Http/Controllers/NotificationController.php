<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function create()
    {
        return Inertia::render('notification');
    }

    public function fetch()
    {
        $notification = DB::table('notification')->get();
        return response()->json(['success' => true, 'retrieved' => $notification]);
    }
}
