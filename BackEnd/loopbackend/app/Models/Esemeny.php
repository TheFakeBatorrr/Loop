<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Ertekeles;
use App\Models\User;

class Esemeny extends Model
{
    protected $table = "esemeny";

    protected $fillable = [
        "tipus",
        "tema",
        "cel_evfolyam",
        "datum",
        "terem",
        "max_letszam"
    ];

    public function ertekelesek(){
        return $this->hasMany(Ertekeles::class);
    }

    public function diak(){
        return $this->hasMany(User::class);
    }
}
