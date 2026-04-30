<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Tsy mamorona table — manampy colonne fotsiny amin'ny tasks
        if (Schema::hasTable('tasks')) {
            if (!Schema::hasColumn('tasks', 'terminee')) {
                Schema::table('tasks', function (Blueprint $table) {
                    $table->boolean('terminee')->default(false)->after('status');
                });
            }
        }
    }

    public function down()
    {
        if (Schema::hasTable('tasks') && Schema::hasColumn('tasks', 'terminee')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropColumn('terminee');
            });
        }
    }
};