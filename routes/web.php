<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\http\Controllers\UserController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BillingsController;
use App\Http\Controllers\HistoryController;
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

    // PUT GENERAL ROUTES LAST
    Route::get('manage-accounts', [RegisteredUserController::class, 'create'])
        ->name('manage-accounts.register');
    Route::get('manage-appointments', [AppointmentController::class, 'create'])
        ->name('manage-appointments');
    Route::get('manage-billings', [BillingsController::class, 'create'])
        ->name('manage-billings');
    Route::get('manage-history', [HistoryController::class, 'create'])
        ->name('manage-history');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
