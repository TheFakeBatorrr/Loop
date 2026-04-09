<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Ertekeles;
use App\Models\Staff;




class Diak extends Model
{
    protected $table = "diak";

    protected $fillable = [
        "osztaly",
        "kezdo_evfolyam",
        "idos"
    ];

    public function ertekelesek(){
        return $this->belongsToMany(Ertekeles::class);
    }

    public function staff(){
        return $this->belongsTo(Staff::class);
    }

}
