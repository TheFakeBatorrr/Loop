<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ElnokSeeder extends Seeder
{
    public function run()
    {
        User::firstOrCreate([
            'username' => 'elnok',
            'email' => 'elnok@loop.hu',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'role' => 'President'
        ]);
    }
}