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
        Schema::create('ertekeles', function (Blueprint $table) {
            $table->id();
            $table->foreignId("ertekeles_esemeny_id")->constrained("esemeny","id","ertekeles_esemeny_id");
            $table->foreignId("ertekeles_users_id")->constrained("users","id","ertekeles_users_id");
            $table->integer("ertekeles");
            $table->string("szoveges");
            $table->date("datum");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ertekeles');
    }
};
