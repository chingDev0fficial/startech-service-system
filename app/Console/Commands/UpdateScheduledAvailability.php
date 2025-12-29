<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class UpdateScheduledAvailability extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'availability:update-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update technician availability status based on scheduled dates';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today()->toDateString();
        
        $this->info("Checking for scheduled availability updates for: {$today}");
        Log::info("=== AVAILABILITY UPDATE COMMAND STARTED ===");
        Log::info("Current date: {$today}");
        
        // Find all TECHNICIANS with scheduled_unavailable_date matching today
        $usersToUpdate = DB::table('users')
            ->where('scheduled_unavailable_date', $today)
            ->where('status', '!=', 'unavailable')
            ->where('role', 'technician') // Only affect technicians
            ->get();
        
        Log::info("Found " . $usersToUpdate->count() . " technician(s) to update");
        
        if ($usersToUpdate->isEmpty()) {
            $this->info('No scheduled availability updates found for today.');
            return Command::SUCCESS;
        }
        
        $count = 0;
        foreach ($usersToUpdate as $user) {
            try {
                // Update the technician's status to unavailable
                $updated = DB::table('users')
                    ->where('id', $user->id)
                    ->where('role', 'technician') // Double-check role
                    ->update([
                        'status' => 'unavailable',
                        'scheduled_unavailable_date' => null, // Clear the schedule after applying
                        'updated_at' => now()
                    ]);
                
                if ($updated) {
                    $count++;
                    Log::info("Auto-updated technician ID {$user->id} ({$user->name}) to unavailable status");
                    $this->info("✓ Updated technician: {$user->name} (ID: {$user->id}) to unavailable");
                } else {
                    Log::warning("Failed to update technician ID {$user->id} ({$user->name})");
                    $this->warn("✗ Failed to update: {$user->name} (ID: {$user->id})");
                }
            } catch (\Exception $e) {
                Log::error("Error updating technician ID {$user->id}: " . $e->getMessage());
                $this->error("Error updating {$user->name}: " . $e->getMessage());
            }
        }
        
        $this->info("Successfully updated {$count} technician(s) to unavailable status.");
        Log::info("=== AVAILABILITY UPDATE COMMAND COMPLETED: {$count} updated ===");
        
        return Command::SUCCESS;
    }

    // public function handle()
    // {
    //     $today = Carbon::today()->format('Y-m-d');
        
    //     // Find users whose scheduled date is today
    //     $users = DB::table('users')
    //         ->whereDate('scheduled_unavailable_date', $today)
    //         ->where('availability_status', '!=', 'unavailable')
    //         ->get();

    //     foreach ($users as $user) {
    //         // Update status to unavailable
    //         DB::table('users')
    //             ->where('id', $user->id)
    //             ->update([
    //                 'availability_status' => 'unavailable',
    //                 'scheduled_unavailable_date' => null,
    //                 'updated_at' => now()
    //             ]);
    //     }
    // }
}
