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
        Schema::create('job_application_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained('job_applications')->cascadeOnDelete();
            $table->string('action');
            $table->foreignId('from_status_id')->nullable()->constrained('md_application_statuses')->nullOnDelete();
            $table->foreignId('to_status_id')->nullable()->constrained('md_application_statuses')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamp('changed_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_application_histories');
    }
};
