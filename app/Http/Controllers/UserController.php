<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Jobs\DeleteUserJob;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * this will retrieve all the registered user
     *
     * @return json|array
     */
    public function fetch()
    {
        $users = DB::table('users')->get();

        if ( $users )
            return response()->json(['success' => true, 'retrieved' => $users]);

        return response()->json(['success' => false]);
    }

    public function destroy ( User $user )
    {
        Log::info('User ID: ' . $user->id);

        try {
            DeleteUserJob::dispatch($user->id);
            return response()->json(["success" => true]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(["success" => false, "error" => $e->getMessage()]);
        }
    }
}
