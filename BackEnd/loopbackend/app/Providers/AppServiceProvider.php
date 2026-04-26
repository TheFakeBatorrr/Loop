<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\PersonalAccessToken;
use Carbon\Carbon;
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
        PersonalAccessToken::creating(function ($token) {
            $expiration = config('sanctum.expiration');
            if ($expiration) {
                $token->expires_at = Carbon::now()->addMinutes($expiration);
            }
        });
    }
}
