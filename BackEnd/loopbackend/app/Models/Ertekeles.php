<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Esemeny;
use App\Models\Diak;



class Ertekeles extends Model
{
    protected $table = "ertekeles";

    protected $fillable = [
        "esemney_id",
        "diak_id",
        "ertekeles",
        "szoveges",
        "datum"
    ];

    public function esemeny(){
        return $this->belongsTo(Esemeny::class);
    }

    public function diak(){
        return $this->hasMany(Diak::class);
    }
}
