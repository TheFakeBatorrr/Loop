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
        Schema::create('_i_d_o_esemeny', function (Blueprint $table) {
            $table->id();
            $table->foreignId("esemeny_id");
            $table->string("foszervezo");
            $table->foreignId("foszervezo_id");
            $table->string("bevetel");
            $table->string("kiadás");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('_i_d_o_esemeny');
    }
};
