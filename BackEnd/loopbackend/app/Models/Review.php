<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Event;
use App\Models\User;



class Review extends Model
{
    protected $table = "reviews";

    protected $fillable = [
        "reviews_event_id",
        "reviews_user_id",
        "review",
        "content",
        "date"
    ];

    public function event(){
        return $this->belongsTo(Event::class, 'reviews_event_id');
    }

    public function diak(){
        return $this->hasMany(User::class);
    }
}
