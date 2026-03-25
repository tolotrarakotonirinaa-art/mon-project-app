<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Messages de chat
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->string('sender');
            $table->string('avatar', 10)->nullable();
            $table->text('message');
            $table->string('channel', 50)->default('general');
            $table->string('time', 10)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Activités récentes (fil d'activité du dashboard)
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('user')->nullable();
            $table->text('action');
            $table->string('icon', 50)->default('user');
            $table->string('color', 20)->default('#00c8ff');
            $table->string('time', 50)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Notifications utilisateur
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50)->default('info');  // task, deploy, mention, info
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->string('time', 50)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('chat_messages');
    }
};
