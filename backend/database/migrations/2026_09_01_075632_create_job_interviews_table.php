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
        Schema::create('job_interviews', function (Blueprint $table) {
            $table->id();
            $table->string('job_interview_code')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('job_application_id');
            $table->string('interview_type')->nullable();
            $table->string('round_name')->nullable();
            $table->dateTime('scheduled_at')->nullable();
            $table->integer('duration')->nullable();
            $table->string('location')->nullable();
            $table->string('meeting_url')->nullable();
            $table->string('interviewer_name')->nullable();
            $table->text('notes')->nullable();
            $table->string('outcome')->nullable();
            $table->timestamps();

            $table->index(['job_application_id', 'scheduled_at']);
            $table->index(['user_id', 'scheduled_at']);
            $table->foreign(['job_application_id', 'user_id'])
                ->references(['id', 'user_id'])
                ->on('job_applications')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_interviews');
    }
};
