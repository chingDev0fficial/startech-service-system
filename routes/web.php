<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\http\Controllers\UserController;
use App\Http\Controllers\AppointmentController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // PUT SPECIFIC ROUTES FIRST
    Route::get('manage-accounts/fetch', [UserController::class, 'fetch']);
    Route::post('manage-accounts', [RegisteredUserController::class, 'store']);
    Route::delete('manage-accounts/delete/{user}', [UserController::class, 'destroy']);
    Route::get('manage-accounts/edit/{user}', [UserController::class, 'singleFetch'])
        ->name('user.fetch');
    Route::patch('manage-accounts/edit/{user}', [UserController::class, 'update'])
        ->name('user.update');

    Route::get('manage-appointments/fetch', [AppointmentController::class, 'fetch']);
    Route::post('manage-appointments/accept/{appointment}', [AppointmentController::class, 'accept'])
        ->name('appointment.accept');
    Route::post('manage-appointments/decline/{appointment}', [AppointmentController::class, 'decline'])
        ->name('appointment.decline');

    // PUT GENERAL ROUTES LAST
    Route::get('manage-accounts', [RegisteredUserController::class, 'create'])
        ->name('manage-accounts.register');
    Route::get('manage-appointments', [AppointmentController::class, 'create'])
        ->name('manage-appointments');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
