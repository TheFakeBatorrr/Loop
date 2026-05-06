<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\User;

class Ido_applys extends Model
{
    protected $table = "ido_applys";

    protected $fillable = [
        "ido_applys_users_id",
        "motivation",
        "experince",
        "accepted"
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'ido_applys_users_id');
    }
}
