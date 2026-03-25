<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repositories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('visibility', ['public', 'private'])->default('private');
            $table->string('lang', 50)->default('JavaScript');
            $table->string('url')->nullable();
            $table->unsignedInteger('stars')->default(0);
            $table->unsignedInteger('forks')->default(0);
            $table->unsignedInteger('branches')->default(1);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repositories');
    }
};
