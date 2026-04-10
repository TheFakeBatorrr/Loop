<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Event;


class Staff extends Model
{
    protected $table = "staff";

    protected $fillable = [
        "staff_users_id",
        "staff_events_id",
        "role",
        "accepted"
    ];

    public function event(){
        return $this->belongsToMany(Event::class);
    }

    public function diak(){
        return $this->belongsTo(User::class);
    }
}
