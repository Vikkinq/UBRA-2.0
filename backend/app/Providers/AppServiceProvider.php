<?php

namespace App\Providers;

use App\Models\Document;
use App\Models\JobApplication;
use App\Models\JobInterview;
use App\Models\User;
use App\Observers\ReferenceCodeObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        User::observe(ReferenceCodeObserver::class);
        JobApplication::observe(ReferenceCodeObserver::class);
        JobInterview::observe(ReferenceCodeObserver::class);
        Document::observe(ReferenceCodeObserver::class);
    }
}
