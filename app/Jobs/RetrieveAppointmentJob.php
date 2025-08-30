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
        // Retrieve appointments with client data
        $appointments = DB::table('appointment')
            ->join('client', 'appointment.client_id', '=', 'client.id')
            ->select(
                'appointment.*',
                'client.name as client_name',
                'client.email as client_email',
                'client.phone_number as client_phone'
            )
            ->get();

        Log::info("Retrieved appointments count: " . $appointments);

        // Broadcast the data
        broadcast(new RetrieveAppointment($appointments))->toOthers();
    }
}
