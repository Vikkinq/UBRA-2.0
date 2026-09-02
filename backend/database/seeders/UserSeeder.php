<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\User;

use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $password = "password";

        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@gmail.com',
                'role' => 'Super Admin',
            ],
            [
                'name' => 'Symon',
                'email' => 'symon@gmail.com',
                'role' => 'User',
            ]
        ];

        foreach($users as $userData) {
            $user = User::query()->updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => Hash::make($password),
                    'email_verified_at' => Carbon::now(),
                    'role' => $userData['role'],
                ]
            );
        }
    }
}
