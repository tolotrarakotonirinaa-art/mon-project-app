<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('environments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['dev', 'staging', 'production'])->default('dev');
            $table->enum('status', ['running', 'stopped', 'deploying', 'error'])->default('stopped');
            $table->string('url')->nullable();
            $table->string('version', 30)->default('1.0.0');
            $table->date('last_deploy')->nullable();
            $table->unsignedTinyInteger('cpu')->default(0);
            $table->unsignedTinyInteger('memory')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('environments');
    }
};
