<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Esemeny;
use App\Models\User;



class Ertekeles extends Model
{
    protected $table = "ertekeles";

    protected $fillable = [
        "ertekeles_esemeny_id",
        "ertekeles_users_id",
        "ertekeles",
        "szoveges",
        "datum"
    ];

    public function esemeny(){
        return $this->belongsTo(Esemeny::class);
    }

    public function diak(){
        return $this->hasMany(User::class);
    }
}
