<?php

namespace App\Services;

use App\Models\User;

class AuthenticationService
{
    public function currentUserPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'career_profile' => $user->careerProfile,
        ];
    }

    public function redirectPathFor(User $user): string
    {
        return $user->isAdmin() ? '/admin/dashboard' : '/dashboard';
    }
}