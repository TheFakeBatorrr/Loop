<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\User;

class Ido_applys extends Model
{
    protected $table = "ido_applys";

    protected $fillable = [
        "users_id",
        "motivation",
        "experince",
        "accepted"
    ];

    public function diak(){
        return $this->belongsTo(User::class);
    }
}
