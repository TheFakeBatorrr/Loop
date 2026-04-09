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
        Schema::create('ido_applys', function (Blueprint $table) {
            $table->id();
            $table->foreignId("ido_applys_users_id")->constrained("users");
            $table->string("motivation");
            $table->string("experince");
            $table->boolean("accepted")->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ido_applys');
    }
};
