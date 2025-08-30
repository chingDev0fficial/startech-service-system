<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BillingsController;
use App\Http\Controllers\HistoryController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard with role-based redirect
    Route::get('dashboard', function () {
        $user = auth()->user();

        return match($user->role) {
            'super user' => Inertia::render('dashboard'),
            'staff' => redirect()->route('manage-appointments'),
            'technician' => redirect()->route('my-appointments'),
            default => Inertia::render('dashboard'),
        };
    })->name('dashboard');

    // Admin-only routes
    Route::middleware(['role:super user'])->group(function () {
        Route::get('manage-accounts/fetch', [UserController::class, 'fetch']);
        Route::post('manage-accounts', [RegisteredUserController::class, 'store']);
        Route::delete('manage-accounts/delete/{user}', [UserController::class, 'destroy']);
        Route::get('manage-accounts/edit/{user}', [UserController::class, 'singleFetch'])
            ->name('user.fetch');
        Route::patch('manage-accounts/edit/{user}', [UserController::class, 'update'])
            ->name('user.update');
        Route::get('manage-accounts', [RegisteredUserController::class, 'create'])
            ->name('manage-accounts.register');
        Route::get('manage-billings', [BillingsController::class, 'create'])
            ->name('manage-billings');
        Route::get('manage-history', [HistoryController::class, 'create'])
            ->name('manage-history');
    });

    // Admin & Staff routes
    Route::middleware(['role:super user,staff'])->group(function () {
        Route::get('manage-appointments/fetch', [AppointmentController::class, 'fetch']);
        Route::post('manage-appointments/accept/{appointment}', [AppointmentController::class, 'accept'])
            ->name('appointment.accept');
        Route::post('manage-appointments/decline/{appointment}', [AppointmentController::class, 'decline'])
            ->name('appointment.decline');
        Route::get('manage-appointments', [AppointmentController::class, 'create'])
            ->name('manage-appointments');
    });

    // Customer routes
    Route::middleware(['role:technician'])->group(function () {
        Route::get('my-appointments', [App\Http\Controllers\MyAppointmentController::class, 'create'])
            ->name('my-appointments');
        Route::get('in-progress', [App\Http\Controllers\InProgressController::class, 'create'])
            ->name('in-progress');
        Route::get('completed-today', [App\Http\Controllers\CompletedTodayController::class, 'create'])
            ->name('completed-today');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
