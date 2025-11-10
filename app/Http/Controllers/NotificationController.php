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
        try {
            $notification = DB::table('notification')
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json(['success' => true, 'retrieved' => $notification]);
        } catch (\Exception $e) {
            Log::error('Error fetching notifications: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch notifications.'], 500);
        }
    }

    public function markAsRead(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'required|integer|exists:notification,id',
            ]);

            DB::table('notification')
                ->where('id', $validated['id'])
                ->update(['status' => 'read', 'updated_at' => now()]);
            
            return response()->json(['success' => true, 'message' => 'Notification marked as read.']);
        } catch (\Exception $e) {
            Log::error('Error marking notification as read: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to mark notification as read.'], 500);
        }
    }

    public function markAllAsRead()
    {
        try {
            DB::table('notification')
                ->where('status', '!=', 'read')
                ->update(['status' => 'read', 'updated_at' => now()]);
            
            return response()->json(['success' => true, 'message' => 'All notifications marked as read.']);
        } catch (\Exception $e) {
            Log::error('Error marking all notifications as read: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to mark all notifications as read.'], 500);
        }
    }

    public function clearAll()
    {
        try {
            DB::table('notification')->delete();
            return response()->json(['success' => true, 'message' => 'All notifications cleared.']);
        } catch (\Exception $e) {
            Log::error('Error clearing all notifications: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to clear all notifications.'], 500);
        }
    }

    public function clear(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'required|integer|exists:notification,id',
            ]);

            DB::table('notification')
                ->where('id', $validated['id'])
                ->delete();
            
            return response()->json(['success' => true, 'message' => 'Notification cleared.']);
        } catch (\Exception $e) {
            Log::error('Error clearing notification: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to clear notification.'], 500);
        }
    }
}
