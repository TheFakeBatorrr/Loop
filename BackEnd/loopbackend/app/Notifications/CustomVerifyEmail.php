<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends VerifyEmail
{
    

    protected function verificationUrl($notifiable)
    {
        $backendUrl = 'http://127.0.0.1:8000';

        $temporarySignedUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        // EZ FONTOS:
        $temporarySignedUrl = str_replace(
            config('app.url'),
            $backendUrl,
            $temporarySignedUrl
        );

        return 'http://localhost:3000/main/verify-email?verify_url=' 
            . urlencode($temporarySignedUrl);
    }
}