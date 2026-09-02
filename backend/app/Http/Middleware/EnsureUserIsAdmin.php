<?php

namespace App\Http\Middleware;

use App\Services\AuthenticationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function __construct(protected AuthenticationService $auth) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'Forbidden.',
                'redirect' => $user ? $this->auth->redirectPathFor($user) : '/login',
            ], 403);
        }

        return $next($request);
    }
}