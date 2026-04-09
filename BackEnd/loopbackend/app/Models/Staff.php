<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Staff extends Model
{
    protected $table = "staff";

    protected $fillable = [
        "staff_users_id",
        "staff_esemeny_id",
        "szerep"
    ];

    public function esemeny(){
        return $this->belongsToMany(Esemeny::class);
    }

    public function diak(){
        return $this->belongsTo(User::class);
    }
}
