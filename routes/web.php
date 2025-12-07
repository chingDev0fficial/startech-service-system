<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BillingsController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ClientController;
use Inertia\Inertia;

Route::get('get-service-price', [DashboardController::class, 'getServicePrice'])
    ->name('client.get.service.price');

Route::middleware(['client'])->group(function () {

    Route::get('/client', function () {
        return Inertia::render('welcome');
    })->name('home');

    Route::get('/client-transactions', [ClientController::class, 'createHist'])
        ->name('client.appointment.transactions');

    Route::get('/client-transactions/fetch', [ClientController::class, 'fetchTransactions'])
        ->name('client.appointment.transactions.fetch');

    Route::post('/client-transactions/rate/submit', [ClientController::class, 'submitRating'])
        ->name('client.appointment.rate.submit');
});

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
        Route::get('dashboard/fetch-todays-appointment', [DashboardController::class, 'fetchTodaysAppoint'])
            ->name('fetch.todaysAppoint');
        Route::get('dashboard/get-service-price', [DashboardController::class, 'getServicePrice'])
            ->name('get.service.price');
        Route::get('dashboard/fetch-technician', [DashboardController::class, 'fetchTech']);
        Route::post('dashboard/set-service-price', [DashboardController::class, 'updateServicePrice'])
            ->name('update.service.price');
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
        Route::get('manage-accounts/fetch', [UserController::class, 'fetch']);
        Route::get('manage-appointments/fetch', [AppointmentController::class, 'fetch'])
            ->name('appointment.fetch');
        Route::post('manage-appointments/accept/{appointment}', [AppointmentController::class, 'accept'])
            ->name('appointment.accept');
        Route::post('manage-appointments/decline/{appointment}', [AppointmentController::class, 'decline'])
            ->name('appointment.decline');
        Route::get('manage-appointments', [AppointmentController::class, 'create'])
            ->name('manage-appointments');

        /* Route::post */
        Route::get('manage-billings', [BillingsController::class, 'create'])
            ->name('manage-billings');
        /* Route::get('manage-history', [HistoryController::class, 'create']) */
        /*     ->name('manage-history'); */
        Route::get('/manage-history/{service_location}', [HistoryController::class, 'create'])
            ->where('service_location', 'in-store|home-service')
            ->name('manage-history');

        Route::get('/manage-history/fetch', [HistoryController::class, 'fetch'])
            ->name('manage-history.fetch');

        Route::get('notification', [NotificationController::class, 'create'])
            ->name('notif');
        Route::get('notification/fetch', [NotificationController::class, 'fetch'])
            ->name('notification.fetch');
        Route::post('notification/mark-as-read', [NotificationController::class, 'markAsRead'])
            ->name('notification.markAsRead');
        Route::post('notification/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])
            ->name('notification.markAllAsRead');
        Route::post('notification/clear-all', [NotificationController::class, 'clearAll'])
            ->name('notification.clearAll');
        Route::post('notification/clear', [NotificationController::class, 'clear'])
            ->name('notification.clear');
        /* Route::get('my-appointments/fetch', [App\Http\Controllers\MyAppointmentController::class, 'fetch']) */
        /*     ->name('my-appointments.fetch'); */

    });

    // Customer routes
    Route::middleware(['role:technician'])->group(function () {

        Route::get('my-appointments', [App\Http\Controllers\MyAppointmentController::class, 'create'])
            ->name('my-appointments');
        Route::get('in-progress', [App\Http\Controllers\InProgressController::class, 'create'])
            ->name('in-progress');
        Route::get('completed-today', [App\Http\Controllers\CompletedTodayController::class, 'create'])
            ->name('completed-today');

        Route::get('my-appointments/fetch', [App\Http\Controllers\MyAppointmentController::class, 'fetch'])
            ->name('my-appointments.fetch');
        Route::get('my-appointments/availability/status', [App\Http\Controllers\MyAppointmentController::class, 'fetchAvailability'])
            ->name('my-appointments.availability.status');
        Route::post('my-appointments/availability/update', [App\Http\Controllers\MyAppointmentController::class, 'updateAvailability'])
            ->name('my-appointments.availability.update');
        Route::post('my-appointments/transfer', [App\Http\Controllers\MyAppointmentController::class, 'transfer'])
            ->name('appointment.transfer');
        Route::post('in-progress', [App\Http\Controllers\InProgressController::class, 'update'])
            ->name('in-progress.mark-in-progress');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
