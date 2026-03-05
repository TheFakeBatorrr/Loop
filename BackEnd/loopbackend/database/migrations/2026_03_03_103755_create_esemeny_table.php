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
        Schema::create('esemeny', function (Blueprint $table) {
            $table->id();
            $table->string("tipus");
            $table->string("tema");
            $table->string("cel_evfolyam");
            $table->date("datum");
            $table->string("terem");
            $table->integer("max_letszam");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('esemeny');
    }
};
