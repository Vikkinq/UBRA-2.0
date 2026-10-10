<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reference_code_counters', function (Blueprint $table) {
            $table->id();
            $table->string('entity', 64);
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('last_value')->default(0);
            $table->timestamps();

            $table->unique(['entity', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reference_code_counters');
    }
};
