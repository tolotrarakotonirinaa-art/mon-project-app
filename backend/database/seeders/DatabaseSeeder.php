<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. USERS ─────────────────────────────────────────────
        $users = [
            [
                'id'        => 1,
                'name'      => 'Admin User',
                'email'     => 'admin@devenviron.com',
                'password'  => Hash::make('password123'),
                'role'      => 'admin',
                'avatar'    => 'AU',
                'bio'       => 'Administrateur de la plateforme DevEnviron',
                'join_date' => '2024-01-15',
                'created_at'=> now(),
                'updated_at'=> now(),
            ],
            [
                'id'        => 2,
                'name'      => 'John Doe',
                'email'     => 'john.doe@example.com',
                'password'  => Hash::make('password123'),
                'role'      => 'dev',
                'avatar'    => 'JD',
                'bio'       => 'Développeur fullstack React/Node.js',
                'join_date' => '2024-03-10',
                'created_at'=> now(),
                'updated_at'=> now(),
            ],
            [
                'id'        => 3,
                'name'      => 'Marie Dubois',
                'email'     => 'marie.dubois@example.com',
                'password'  => Hash::make('password123'),
                'role'      => 'dev',
                'avatar'    => 'MD',
                'bio'       => 'Développeuse frontend spécialisée React',
                'join_date' => '2024-04-22',
                'created_at'=> now(),
                'updated_at'=> now(),
            ],
            [
                'id'        => 4,
                'name'      => 'Jean Martin',
                'email'     => 'jean.martin@example.com',
                'password'  => Hash::make('password123'),
                'role'      => 'dev',
                'avatar'    => 'JM',
                'bio'       => 'Ingénieur backend Node.js/MongoDB',
                'join_date' => '2024-05-05',
                'created_at'=> now(),
                'updated_at'=> now(),
            ],
            [
                'id'        => 5,
                'name'      => 'Sophie Lambert',
                'email'     => 'sophie.lambert@example.com',
                'password'  => Hash::make('password123'),
                'role'      => 'client',
                'avatar'    => 'SL',
                'bio'       => 'Chef de projet côté client',
                'join_date' => '2024-06-18',
                'created_at'=> now(),
                'updated_at'=> now(),
            ],
        ];
        DB::table('users')->insert($users);

        // ── 2. PROJECTS ──────────────────────────────────────────
        $projects = [
            [
                'id'          => 1,
                'name'        => 'Site E-commerce',
                'description' => 'Interface React + Node.js pour boutique en ligne',
                'status'      => 'active',
                'progress'    => 75,
                'start_date'  => '2024-10-01',
                'end_date'    => '2024-12-15',
                'color'       => '#00c8ff',
                'team'        => json_encode(['JD', 'MD', 'SL']),
                'tags'        => json_encode(['React', 'Node.js', 'MongoDB']),
                'created_by'  => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'id'          => 2,
                'name'        => 'API de paiement',
                'description' => 'API Stripe avec Node.js et MongoDB',
                'status'      => 'active',
                'progress'    => 60,
                'start_date'  => '2024-09-15',
                'end_date'    => '2024-11-30',
                'color'       => '#7c3aed',
                'team'        => json_encode(['JM', 'AU']),
                'tags'        => json_encode(['Node.js', 'Stripe', 'MongoDB']),
                'created_by'  => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'id'          => 3,
                'name'        => 'App Mobile',
                'description' => 'React Native pour iOS et Android',
                'status'      => 'pending',
                'progress'    => 20,
                'start_date'  => '2024-11-01',
                'end_date'    => '2025-02-28',
                'color'       => '#00ff88',
                'team'        => json_encode(['JD', 'SL']),
                'tags'        => json_encode(['React Native', 'Expo']),
                'created_by'  => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'id'          => 4,
                'name'        => 'Dashboard Analytics',
                'description' => 'Dashboard temps réel avec WebSocket',
                'status'      => 'active',
                'progress'    => 45,
                'start_date'  => '2024-10-15',
                'end_date'    => '2025-01-30',
                'color'       => '#ff6b35',
                'team'        => json_encode(['MD', 'JM']),
                'tags'        => json_encode(['React', 'WebSocket', 'D3.js']),
                'created_by'  => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ];
        DB::table('projects')->insert($projects);

        // ── 3. TASKS ─────────────────────────────────────────────
        $tasks = [
            ['title' => 'Corriger bug login',     'project' => 'Site E-commerce',     'status' => 'todo',       'priority' => 'high',   'assignee' => 'JD', 'due_date' => '2024-11-10', 'description' => 'Bug sur la page de connexion mobile',       'created_by' => 1],
            ['title' => 'Implémenter API REST',   'project' => 'API de paiement',     'status' => 'inprogress', 'priority' => 'medium', 'assignee' => 'JM', 'due_date' => '2024-11-15', 'description' => 'Endpoints CRUD pour les paiements',          'created_by' => 1],
            ['title' => 'Tests unitaires',        'project' => 'App Mobile',          'status' => 'done',       'priority' => 'low',    'assignee' => 'SL', 'due_date' => '2024-11-05', 'description' => 'Tests Jest pour les composants',             'created_by' => 1],
            ['title' => 'Design responsive',      'project' => 'Site E-commerce',     'status' => 'todo',       'priority' => 'medium', 'assignee' => 'MD', 'due_date' => '2024-11-12', 'description' => 'Adaptation mobile/tablette',                 'created_by' => 1],
            ['title' => 'Documentation API',      'project' => 'API de paiement',     'status' => 'inprogress', 'priority' => 'low',    'assignee' => 'JD', 'due_date' => '2024-11-20', 'description' => 'Swagger + README',                          'created_by' => 1],
            ['title' => 'Config CI/CD',           'project' => 'App Mobile',          'status' => 'todo',       'priority' => 'high',   'assignee' => 'AU', 'due_date' => '2024-11-08', 'description' => 'GitHub Actions pipeline',                   'created_by' => 1],
            ['title' => 'Optimiser requêtes BDD', 'project' => 'Dashboard Analytics', 'status' => 'done',       'priority' => 'high',   'assignee' => 'JM', 'due_date' => '2024-11-01', 'description' => 'Index + cache Redis',                       'created_by' => 1],
        ];
        foreach ($tasks as &$t) {
            $t['created_at'] = now();
            $t['updated_at'] = now();
        }
        DB::table('tasks')->insert($tasks);

        // ── 4. REPOSITORIES ──────────────────────────────────────
        $repos = [
            ['name' => 'frontend-ecommerce', 'description' => 'Interface React',   'visibility' => 'public',  'stars' => 12, 'forks' => 3, 'lang' => 'JavaScript',  'url' => 'https://github.com/devenviron/frontend-ecommerce', 'created_by' => 1],
            ['name' => 'backend-api',        'description' => 'API Node.js',       'visibility' => 'private', 'stars' => 8,  'forks' => 1, 'lang' => 'Node.js',      'url' => 'https://github.com/devenviron/backend-api',        'created_by' => 1],
            ['name' => 'mobile-app',         'description' => 'React Native',      'visibility' => 'private', 'stars' => 5,  'forks' => 0, 'lang' => 'React Native', 'url' => 'https://github.com/devenviron/mobile-app',         'created_by' => 1],
            ['name' => 'devenviron-backend', 'description' => 'API Laravel PHP',   'visibility' => 'private', 'stars' => 3,  'forks' => 0, 'lang' => 'PHP/Laravel',  'url' => 'https://github.com/devenviron/devenviron-backend',  'created_by' => 1],
        ];
        foreach ($repos as &$r) {
            $r['branches']   = 2;
            $r['created_at'] = now();
            $r['updated_at'] = now();
        }
        DB::table('repositories')->insert($repos);

        // ── 5. ENVIRONMENTS ──────────────────────────────────────
        $envs = [
            ['name' => 'Développement', 'type' => 'dev',        'status' => 'running', 'url' => 'https://dev.example.com',     'version' => '1.3.0', 'last_deploy' => '2024-11-05', 'cpu' => 23, 'memory' => 45, 'created_by' => 1],
            ['name' => 'Staging',       'type' => 'staging',    'status' => 'running', 'url' => 'https://staging.example.com', 'version' => '1.2.5', 'last_deploy' => '2024-11-03', 'cpu' => 45, 'memory' => 62, 'created_by' => 1],
            ['name' => 'Production',    'type' => 'production', 'status' => 'running', 'url' => 'https://example.com',         'version' => '1.2.0', 'last_deploy' => '2024-10-28', 'cpu' => 67, 'memory' => 78, 'created_by' => 1],
        ];
        foreach ($envs as &$e) {
            $e['created_at'] = now();
            $e['updated_at'] = now();
        }
        DB::table('environments')->insert($envs);

        // ── 6. PIPELINE ──────────────────────────────────────────
        DB::table('pipeline_status')->insert([
            'checkout'   => 'completed',
            'tests'      => 'active',
            'build'      => 'pending',
            'deploy'     => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $logs = [
            ['time' => '14:30:01', 'text' => 'Démarrage pipeline CI/CD v2.1.0',     'level' => 'info'],
            ['time' => '14:30:12', 'text' => 'Récupération depuis origin/main... ✓', 'level' => 'success'],
            ['time' => '14:31:05', 'text' => 'npm install (125 packages)... ✓',      'level' => 'success'],
            ['time' => '14:33:20', 'text' => 'Tests unitaires en cours...',          'level' => 'info'],
            ['time' => '14:35:44', 'text' => '152 tests passés — 0 échecs ✓',       'level' => 'success'],
            ['time' => '14:36:01', 'text' => 'Build en attente...',                  'level' => 'warning'],
        ];
        foreach ($logs as &$l) {
            $l['created_at'] = now();
            $l['updated_at'] = now();
        }
        DB::table('pipeline_logs')->insert($logs);

        // ── 7. CHAT MESSAGES ─────────────────────────────────────
        $messages = [
            ['sender' => 'Marie Dubois', 'avatar' => 'MD', 'message' => 'Bonjour! Les tests v1.3 sont prêts 🎉', 'channel' => 'general', 'time' => '14:20', 'user_id' => 3],
            ['sender' => 'Admin User',   'avatar' => 'AU', 'message' => 'Super! Je prépare le déploiement.',     'channel' => 'general', 'time' => '14:22', 'user_id' => 1],
            ['sender' => 'Jean Martin',  'avatar' => 'JM', 'message' => "N'oubliez pas la documentation.",        'channel' => 'general', 'time' => '14:25', 'user_id' => 4],
        ];
        foreach ($messages as &$m) {
            $m['created_at'] = now();
            $m['updated_at'] = now();
        }
        DB::table('chat_messages')->insert($messages);

        // ── 8. ACTIVITIES ─────────────────────────────────────────
        $activities = [
            ['user' => 'Marie Dubois', 'action' => 'a poussé du code sur frontend-ecommerce', 'icon' => 'code-branch',  'time' => 'Il y a 15 min', 'color' => '#00c8ff', 'user_id' => 3],
            ['user' => 'Jean Martin',  'action' => 'a complété "Implémenter API REST"',        'icon' => 'check-circle', 'time' => 'Il y a 1h',     'color' => '#00ff88', 'user_id' => 4],
            ['user' => 'Admin User',   'action' => 'a déployé v1.3.0 en développement',        'icon' => 'rocket',       'time' => 'Il y a 3h',     'color' => '#ff6b35', 'user_id' => 1],
        ];
        foreach ($activities as &$a) {
            $a['created_at'] = now();
            $a['updated_at'] = now();
        }
        DB::table('activities')->insert($activities);

        // ── 9. NOTIFICATIONS ─────────────────────────────────────
        $notifications = [
            ['type' => 'task',    'message' => 'Nouvelle tâche assignée : Corriger bug login', 'read' => false, 'time' => '10 min', 'user_id' => 1],
            ['type' => 'deploy',  'message' => 'Déploiement v1.3.0 terminé avec succès',       'read' => false, 'time' => '3h',     'user_id' => 1],
            ['type' => 'mention', 'message' => 'Marie Dubois vous a mentionné dans #général',  'read' => true,  'time' => '1 jour', 'user_id' => 1],
        ];
        foreach ($notifications as &$n) {
            $n['created_at'] = now();
            $n['updated_at'] = now();
        }
        DB::table('notifications')->insert($notifications);

        $this->command->info('✅ Base de données initialisée avec succès !');
        $this->command->info('👤 Utilisateurs créés : admin, dev (x3), client');
        $this->command->info('📁 Projets : 4 | Tâches : 7 | Dépôts : 4 | Environnements : 3');
    }
}
