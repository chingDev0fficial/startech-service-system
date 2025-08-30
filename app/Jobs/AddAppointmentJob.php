<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use App\Events\AddAppointment;
use App\Models\Appointment;

class AddAppointmentJob implements ShouldQueue
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
        $appointment = Appointment::create([
            'client_id'         => $this->data->clientId,
            'item'              => $this->data->item,
            'service_type'      => $this->data->serviceType,
            'service_location'  => $this->data->serviceLocation,
            'description'       => $this->data->description,
            'schedule_at'       => $this->data->schedule_at,
        ]);

        broadcast(new AddAppointment($appointment))->toOthers();
    }
}
