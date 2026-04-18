<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Review;
use App\Models\User;

class Event extends Model
{
    protected $table = "events";

    protected $fillable = [
        "name",
        "type",
        "status",
        "topic",
        "target_audience",
        "date",
        "location",
        "max_capacity",
        "visibility",
        "created_by"
    ];

    public function reviews(){
        return $this->hasMany(Review::class);
    }

    public function diak(){
        return $this->hasMany(User::class);
    }
}
