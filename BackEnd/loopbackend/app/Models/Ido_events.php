<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Event;
use App\Models\Review;



class Ido_events extends Model
{
    protected $table = "ido_events";

    protected $fillable = [
        "ido_event_id",
        "main_organizer_id",
        "revenue",
        "expanses"
    ];

    public function event(){
        return $this->belongsTo(Event::class);
    }

    public function ertekelesek(){
        return $this->hasMany(Review::class);
    }
}
