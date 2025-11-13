<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use App\Events\clientTransaction;
use App\Http\Controllers\HistoryController;

class clientTransactionJob implements ShouldQueue
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
        $histController = new HistoryController();
        $clientHist = $histController->fetch();

        broadcast(new clientTransaction($services))->toOthers();
    }
}
