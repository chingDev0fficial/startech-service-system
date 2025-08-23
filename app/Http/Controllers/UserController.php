<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Jobs\DeleteUserJob;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

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

    public function singleFetch ( User $user )
    {
        /* Log::info( 'User ID: ' . $user->id ); */

        $user = DB::table('users')->where('id', $user->id)->first();

        return response()->json(["success" => true, "data" => $user]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|string|max:255',
            'password'  => 'nullable|string|max:255', // Make it optional
            'role'      => 'required|string|max:20',
        ]);

        $user = DB::table('users')->where('id', $id)->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ];

        // Only update password if it's provided and different
        if ($request->filled('password') && !Hash::check($request->password, $user->password)) {
            $updateData['password'] = Hash::make($request->password);
            Log::info("Password updated for user ID: $id");
        }

        DB::table('users')->where('id', $id)->update($updateData);

        return redirect()->route('manage-accounts.register')->with('success', 'User updated successfully');
    }
}
