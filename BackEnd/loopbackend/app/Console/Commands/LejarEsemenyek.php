<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Event;
use Carbon\Carbon;

class LejarEsemenyek extends Command
{
    protected $signature = 'esemeny:lejar';
    protected $description = 'Lejárt események lezárása';

    public function handle()
    {
        Event::where('date', '<', Carbon::now())
            ->where('status', '!=', 'lezart')
            ->update(['status' => 'lezart']);

        $this->info('Lejárt események lezárva!');
    }
}