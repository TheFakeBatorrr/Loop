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
            $table->foreignId("ido_event_id")->constrained("events");  // ← events.id-re mutat
            $table->string("main_organizer");
            $table->foreignId("main_organizer_id")->constrained("users"); // ← users.id-re mutat
            $table->string("revenue");
            $table->string("expanses");
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
