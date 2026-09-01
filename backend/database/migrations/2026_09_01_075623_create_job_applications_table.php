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
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained('md_companies')->nullOnDelete();
            $table->string('company_name')->nullable();
            $table->foreignId('status_id')->constrained('md_application_statuses');
            $table->foreignId('employment_type_id')->nullable()->constrained('md_employment_types')->nullOnDelete();
            $table->foreignId('source_id')->nullable()->constrained('md_job_sources')->nullOnDelete();
            $table->string('job_title');
            $table->string('job_url')->nullable();
            $table->string('location')->nullable();
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->string('salary_currency', 3)->nullable();
            $table->date('applied_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
