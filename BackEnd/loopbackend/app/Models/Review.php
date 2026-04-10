<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Event;
use App\Models\User;



class Review extends Model
{
    protected $table = "reviews";

    protected $fillable = [
        "reviews_events_id",
        "reviews_users_id",
        "review",
        "content",
        "date"
    ];

    public function event(){
        return $this->belongsTo(Event::class);
    }

    public function diak(){
        return $this->hasMany(User::class);
    }
}
