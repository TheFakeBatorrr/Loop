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
        Schema::create('ido_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId("ido_event_id")->constrained("events");
            $table->foreignId("main_organiser_id")->nullable()->constrained("users");
            $table->string("revenue")->nullable();
            $table->string("expanses")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ido_events');
    }
};
