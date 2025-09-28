<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use App\Events\RetrieveNotif;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RetrieveNotifJob implements ShouldQueue
{
    use Queueable;


    protected $data;
    /**
     * Create a new job instance.
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

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
        $notification = DB::table('notification')->get();
        broadcast(new RetrieveNotif($notification))->toOthers();
    }
}
