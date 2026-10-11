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
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('job_application_id');
            $table->string('action');
            $table->foreignId('from_status_id')->nullable()->constrained('md_application_statuses')->nullOnDelete();
            $table->foreignId('to_status_id')->nullable()->constrained('md_application_statuses')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamp('changed_at');
            $table->timestamps();

            $table->index(['user_id', 'job_application_id']);
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
        Schema::dropIfExists('job_application_histories');
    }
};
