<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\User;
use App\Services\ReferenceCodeService;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(ReferenceCodeService $referenceCodeService): void
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
            ],
            [
                'name' => 'Dragon',
                'email' => 'dragon@gmail.com',
                'role' => 'User',
            ]
        ];

        foreach ($users as $userData) {
            DB::transaction(function () use ($userData, $password, $referenceCodeService): void {
                $user = User::query()->firstOrNew(['email' => $userData['email']]);
                $user->name = $userData['name'];
                $user->password = Hash::make($password);
                $user->email_verified_at = Carbon::now();
                $user->role = $userData['role'];

                if (blank($user->user_code)) {
                    $isAdmin = $userData['role'] === 'Super Admin';
                    $prefix = $isAdmin ? 'ADMIN' : 'USER';
                    $entity = $isAdmin ? 'admin' : 'user';
                    $user->user_code = $referenceCodeService->next($entity, $prefix);
                }

                $user->save();
            });
        }
    }
}
