<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use App\Events\RetrieveAppointment;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RetrieveAppointmentJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */

    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
    * Get the middleware the job should pass through.
    *
    * @return array<int, object>
    */
    public function middleware()
    {
        return [
            (new WithoutOverlapping($this->data->client_id))->expireAfter(180)
        ];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $services = DB::table('service')
            ->join('appointment', 'service.appointment_id', '=', 'appointment.id')
            ->join('users', 'service.user_id', '=', 'users.id')
            ->select(
                'service.*',
                'appointment.item as appointment_item',
                'appointment.service_type as appointment_service_type',
                'appointment.client_name',
                'appointment.client_email',
                'appointment.client_phone',
                'users.name as technician_name',
                'users.email as technician_email'
            )
            ->get();

        Log::info("Retrieved appointments count: " . $services);

        // Broadcast the data
        broadcast(new RetrieveServices($services))->toOthers();
    }
}
