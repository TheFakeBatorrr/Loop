<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $table = "staff";

    protected $fillable = [
        "diak_id",
        "esemeny_id",
        "szerep"
    ];

    public function esemeny(){
        return $this->belongsToMany(Esemeny::class);
    }

    public function diak(){
        return $this->belongsTo(Diak::class);
    }
}
