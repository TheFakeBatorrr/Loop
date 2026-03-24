<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('diak', function (Blueprint $table) {
            $table->id();
            $table->string("nev");
            $table->string("email")->unique();
            $table->string("username")->unique();
            $table->string("password");
            $table->string("osztaly");
            $table->string("kezdo_evfolyam");
            $table->boolean("idos");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diak');
    }
};
