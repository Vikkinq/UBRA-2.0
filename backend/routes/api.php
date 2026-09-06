<?php

use App\Services\AuthenticationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\JobApplicationController;

Route::get('/test', function () {
    return response()->json([
        'message' => 'UBRA backend is alive',
        'timestamp' => now(),
    ]);
});

// Shared — any authenticated user (regular or admin)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request, AuthenticationService $auth) {
        return $auth->currentUserPayload($request->user());
    });
});

// User App — regular authenticated users
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/job-applications', [JobApplicationController::class, 'index']);
    Route::post('/job-applications', [JobApplicationController::class, 'store']);
    Route::get('/job-applications/{jobApplication}', [JobApplicationController::class, 'show']);
    Route::put('/job-applications/{jobApplication}', [JobApplicationController::class, 'update']);
    Route::patch('/job-applications/{jobApplication}', [JobApplicationController::class, 'update']);
    Route::delete('/job-applications/{jobApplication}', [JobApplicationController::class, 'destroy']);
});

// Admin App — Super Admin only
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', function (Request $request) {
        return response()->json([
            'message' => 'Welcome, admin.',
            'user' => $request->user()->only(['id', 'name', 'email', 'role']),
        ]);
    });
});