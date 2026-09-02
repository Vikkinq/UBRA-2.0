<?php

use App\Services\AuthenticationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'message' => 'UBRA backend is alive',
        'timestamp' => now(),
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request, AuthenticationService $auth) {
        return $auth->currentUserPayload($request->user());
    });

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', function (Request $request) {
            return response()->json([
                'message' => 'Welcome, admin.',
                'user' => $request->user()->only(['id', 'name', 'email', 'role']),
            ]);
        });
    });
});