<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Student extends Model
{
    protected $table = "students";

    protected $fillable = [
        "users_id",
        "name",
        "class_number",
        "class_letter"
    ];

    public function diak(){
        return $this->belongsTo(User::class);
    }
}
