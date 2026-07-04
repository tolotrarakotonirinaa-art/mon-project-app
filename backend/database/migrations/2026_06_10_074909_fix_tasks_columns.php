<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ity migration ity dia mampiasa syntax SQL manokana ho an'i PostgreSQL
        // (IF NOT EXISTS, ALTER COLUMN TYPE, CHECK constraint amin'ny ARRAY).
        // Amin'ny fitsapana (tests, connexion sqlite in-memory), tsy misy
        // dikany io ALTER TABLE io satria ny tabilao tasks dia efa miendrika
        // marina hatramin'ny fiandohana (jereo migration 000003 sy 000003+).
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return;
        }

        // ✅ 1. assignee VARCHAR(10) → VARCHAR(255)
        DB::statement('ALTER TABLE tasks ALTER COLUMN assignee TYPE VARCHAR(255)');

        // ✅ 2. Ajouter assignee_id si elle n'existe pas
        DB::statement('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL');

        // ✅ 3. Ajouter date_debut si elle n'existe pas
        DB::statement('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS date_debut DATE');

        // ✅ 4. FIX (manquait totalement) : ajouter project_id — la colonne que
        //       le modèle Task, le TaskController et le DatabaseSeeder utilisent
        //       tous, mais qui n'a jamais été créée. Sans elle, migrate:fresh --seed
        //       plante et aucune tâche ne peut être créée via l'API
        //       (SQLSTATE[42703]: column "project_id" does not exist).
        DB::statement('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE');

        // ✅ 5. Supprimer colonne project VARCHAR(10) si elle existe
        DB::statement('ALTER TABLE tasks DROP COLUMN IF EXISTS project');

        // ✅ 6. FIX : le CHECK constraint sur status n'autorisait que
        //       todo/inprogress/done, alors que TaskController (validation,
        //       move(), stats()) utilise aussi 'review'. Sans ce correctif,
        //       déplacer une tâche en "review" provoque une erreur 500
        //       (SQLSTATE[23514]: tasks_status_check violation).
        DB::statement('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check');
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status::text = ANY (ARRAY['todo','inprogress','review','done']::text[]))");
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE tasks ALTER COLUMN assignee TYPE VARCHAR(10)');
        DB::statement('ALTER TABLE tasks DROP COLUMN IF EXISTS assignee_id');
        DB::statement('ALTER TABLE tasks DROP COLUMN IF EXISTS date_debut');
        DB::statement('ALTER TABLE tasks DROP COLUMN IF EXISTS project_id');
        DB::statement('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project VARCHAR(10)');
        DB::statement('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check');
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status::text = ANY (ARRAY['todo','inprogress','done']::text[]))");
    }
};