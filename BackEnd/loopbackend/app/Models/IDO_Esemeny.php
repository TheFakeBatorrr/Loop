<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Esemeny;
use App\Models\Ertekeles;



class IDO_Esemeny extends Model
{
    protected $table = "IDO_esemeny";

    protected $fillable = [
        "ido_esemeny_id",
        "foszervezo",
        "foszervezo_id",
        "bevetel",
        "kiadas"
    ];

    public function esemeny(){
        return $this->belongsTo(Esemeny::class);
    }

    public function ertekelesek(){
        return $this->hasMany(Ertekeles::class);
    }
}
