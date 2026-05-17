<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate([
            'username' => 'asd',
            'email'    => 'asd@gmail.com',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'role'     => 'President',
        ]);

        User::firstOrCreate([
            'username' => 'asd2',
            'email'    => 'asd2@gmail.com',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'role'     => 'Idos',
        ]);

        User::firstOrCreate([
            'username' => 'asd3',
            'email'    => 'asd3@gmail.com',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'role'     => 'Student',
        ]);
    }
    
}