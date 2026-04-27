<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPassword extends Notification
{
    public string $token;

    public function __construct(string $token)
    {
        $this->token = $token;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $url = url('/api/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->email));

        return (new MailMessage)
            ->subject('Jelszó visszaállítás')
            ->line('Kattints a gombra a jelszó visszaállításához!')
            ->action('Jelszó visszaállítása', $url)
            ->line('Ha nem te kérted, hagyd figyelmen kívül!');
    }
}