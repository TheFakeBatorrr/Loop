<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ElnokSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'username' => 'elnok',
            'email' => 'elnok@loop.hu',
            'password' => Hash::make('elnok1234'),
            'role' => 'President'
        ]);
    }
}