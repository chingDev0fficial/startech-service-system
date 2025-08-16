<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;

use App\Events\UserDeleted;

use App\Models\User;

use Illuminate\Support\Facades\Log;

class DeleteUserJob implements ShouldQueue
{
    use Queueable;

    protected $id;

    /**
     * Create a new job instance.
     */
    public function __construct( $id )
    {
        $this->id = $id;
    }

    /**
    * Get the middleware the job should pass through.
    *
    * @return array<int, object>
    */
    public function middleware()
    {
        return [
            // prevent overlap and release lock after 3 minutes
            (new WithoutOverlapping($this->id))->expireAfter(180)
        ];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info("Working? " . $this->id);
        User::find($this->id)?->delete();
        broadcast(new UserDeleted($this->id))->toOthers();
    }
}
