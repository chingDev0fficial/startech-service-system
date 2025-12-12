<?php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('availability:update-scheduled')
             ->daily()
             ->at('00:00');
}