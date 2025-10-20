<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

    public function markAllAsRead()
    {
        DB::table('notification')->update(['status' => 'read']);
        return response()->json(['success' => true, 'message' => 'All notifications marked as read.']);
    }

    public function clearAll()
    {
        DB::table('notification')->delete();
        return response()->json(['success' => true, 'message' => 'All notifications cleared.']);
    }

    public function clear(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:notification,id',
        ]);

        DB::table('notification')->where('id', $validated['id'])->delete();
        return response()->json(['success' => true, 'message' => 'Read notifications cleared.']);
    }
}
