<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'username' => 'asd',
            'email'    => 'asd@gmail.com',
            'password' => Hash::make('12345678'),
            'role'     => 'Student',
        ]);

        User::create([
            'username' => 'asd2',
            'email'    => 'asd2@gmail.com',
            'password' => Hash::make('12345678'),
            'role'     => 'Student',
        ]);

        User::create([
            'username' => 'asd3',
            'email'    => 'asd3@gmail.com',
            'password' => Hash::make('12345678'),
            'role'     => 'Student',
        ]);
    }
    
}