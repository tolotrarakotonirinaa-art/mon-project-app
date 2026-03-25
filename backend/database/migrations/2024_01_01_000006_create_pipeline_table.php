<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table principale du pipeline (une seule ligne = état courant)
        Schema::create('pipeline_status', function (Blueprint $table) {
            $table->id();
            $table->enum('checkout', ['pending', 'active', 'completed', 'failed'])->default('pending');
            $table->enum('tests',    ['pending', 'active', 'completed', 'failed'])->default('pending');
            $table->enum('build',    ['pending', 'active', 'completed', 'failed'])->default('pending');
            $table->enum('deploy',   ['pending', 'active', 'completed', 'failed'])->default('pending');
            $table->timestamps();
        });

        // Logs du pipeline
        Schema::create('pipeline_logs', function (Blueprint $table) {
            $table->id();
            $table->string('time', 10);
            $table->text('text');
            $table->enum('level', ['info', 'success', 'warning', 'error'])->default('info');
            $table->foreignId('triggered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pipeline_logs');
        Schema::dropIfExists('pipeline_status');
    }
};
