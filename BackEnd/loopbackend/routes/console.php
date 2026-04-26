<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


// Minden éjfélkor fut
Schedule::command('esemeny:lejar')->daily();

// Vagy más időzítések:
Schedule::command('esemeny:lejar')->hourly();        // óránként
Schedule::command('esemeny:lejar')->everyMinute();   // percenként
Schedule::command('esemeny:lejar')->weeklyOn(1);     // hétfőnként