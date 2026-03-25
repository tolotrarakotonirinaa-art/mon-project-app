<?php

namespace App\Services;

/**
 * MockDataStore
 * 
 * Phase 1 : Toutes les données sont stockées en mémoire (fichier JSON).
 * Phase 2 : On remplacera par PostgreSQL sans changer les Controllers.
 */
class MockDataStore
{
    private static string $storagePath = __DIR__ . '/../../storage/mock_data.json';

    private static array $defaults = [
        'users' => [
            [
                'id' => 1,
                'name' => 'Admin User',
                'email' => 'admin@devenviron.com',
                'password' => 'password123',
                'role' => 'admin',
                'join_date' => '2024-01-15',
                'avatar' => 'AU',
                'bio' => 'Administrateur de la plateforme DevEnviron',
            ],
            [
                'id' => 2,
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'password' => 'password123',
                'role' => 'dev',
                'join_date' => '2024-03-10',
                'avatar' => 'JD',
                'bio' => 'Développeur fullstack React/Node.js',
            ],
            [
                'id' => 3,
                'name' => 'Marie Dubois',
                'email' => 'marie.dubois@example.com',
                'password' => 'password123',
                'role' => 'dev',
                'join_date' => '2024-04-22',
                'avatar' => 'MD',
                'bio' => 'Développeuse frontend spécialisée React',
            ],
            [
                'id' => 4,
                'name' => 'Jean Martin',
                'email' => 'jean.martin@example.com',
                'password' => 'password123',
                'role' => 'dev',
                'join_date' => '2024-05-05',
                'avatar' => 'JM',
                'bio' => 'Ingénieur backend Node.js/MongoDB',
            ],
            [
                'id' => 5,
                'name' => 'Sophie Lambert',
                'email' => 'sophie.lambert@example.com',
                'password' => 'password123',
                'role' => 'client',
                'join_date' => '2024-06-18',
                'avatar' => 'SL',
                'bio' => 'Chef de projet côté client',
            ],
        ],
        'projects' => [
            [
                'id' => 1,
                'name' => 'Site E-commerce',
                'description' => 'Interface React + Node.js pour boutique en ligne',
                'status' => 'active',
                'progress' => 75,
                'start_date' => '2024-10-01',
                'end_date' => '2024-12-15',
                'team' => ['JD', 'MD', 'SL'],
                'color' => '#00c8ff',
                'tags' => ['React', 'Node.js', 'MongoDB'],
            ],
            [
                'id' => 2,
                'name' => 'API de paiement',
                'description' => 'API Stripe avec Node.js et MongoDB',
                'status' => 'active',
                'progress' => 60,
                'start_date' => '2024-09-15',
                'end_date' => '2024-11-30',
                'team' => ['JM', 'AU'],
                'color' => '#7c3aed',
                'tags' => ['Node.js', 'Stripe', 'MongoDB'],
            ],
            [
                'id' => 3,
                'name' => 'App Mobile',
                'description' => 'React Native pour iOS et Android',
                'status' => 'pending',
                'progress' => 20,
                'start_date' => '2024-11-01',
                'end_date' => '2025-02-28',
                'team' => ['JD', 'SL'],
                'color' => '#00ff88',
                'tags' => ['React Native', 'Expo'],
            ],
            [
                'id' => 4,
                'name' => 'Dashboard Analytics',
                'description' => 'Dashboard temps réel avec WebSocket',
                'status' => 'active',
                'progress' => 45,
                'start_date' => '2024-10-15',
                'end_date' => '2025-01-30',
                'team' => ['MD', 'JM'],
                'color' => '#ff6b35',
                'tags' => ['React', 'WebSocket', 'D3.js'],
            ],
        ],
        'tasks' => [
            ['id' => 1, 'title' => 'Corriger bug login',     'project' => 'Site E-commerce', 'status' => 'todo',       'priority' => 'high',   'assignee' => 'JD', 'due_date' => '2024-11-10', 'description' => 'Bug sur la page de connexion mobile'],
            ['id' => 2, 'title' => 'Implémenter API REST',   'project' => 'API de paiement', 'status' => 'inprogress', 'priority' => 'medium', 'assignee' => 'JM', 'due_date' => '2024-11-15', 'description' => 'Endpoints CRUD pour les paiements'],
            ['id' => 3, 'title' => 'Tests unitaires',        'project' => 'App Mobile',      'status' => 'done',       'priority' => 'low',    'assignee' => 'SL', 'due_date' => '2024-11-05', 'description' => 'Tests Jest pour les composants'],
            ['id' => 4, 'title' => 'Design responsive',      'project' => 'Site E-commerce', 'status' => 'todo',       'priority' => 'medium', 'assignee' => 'MD', 'due_date' => '2024-11-12', 'description' => 'Adaptation mobile/tablette'],
            ['id' => 5, 'title' => 'Documentation API',      'project' => 'API de paiement', 'status' => 'inprogress', 'priority' => 'low',    'assignee' => 'JD', 'due_date' => '2024-11-20', 'description' => 'Swagger + README'],
            ['id' => 6, 'title' => 'Config CI/CD',           'project' => 'App Mobile',      'status' => 'todo',       'priority' => 'high',   'assignee' => 'AU', 'due_date' => '2024-11-08', 'description' => 'GitHub Actions pipeline'],
            ['id' => 7, 'title' => 'Optimiser requêtes BDD', 'project' => 'Dashboard Analytics', 'status' => 'done',   'priority' => 'high',   'assignee' => 'JM', 'due_date' => '2024-11-01', 'description' => 'Index + cache Redis'],
        ],
        'repositories' => [
            ['id' => 1, 'name' => 'frontend-ecommerce', 'description' => 'Interface React',   'visibility' => 'public',  'stars' => 12, 'forks' => 3, 'lang' => 'JavaScript',  'updated' => 'Il y a 2 jours', 'branches' => 4, 'url' => 'https://github.com/devenviron/frontend-ecommerce'],
            ['id' => 2, 'name' => 'backend-api',        'description' => 'API Node.js',       'visibility' => 'private', 'stars' => 8,  'forks' => 1, 'lang' => 'Node.js',      'updated' => 'Il y a 1 jour',  'branches' => 3, 'url' => 'https://github.com/devenviron/backend-api'],
            ['id' => 3, 'name' => 'mobile-app',         'description' => 'React Native',      'visibility' => 'private', 'stars' => 5,  'forks' => 0, 'lang' => 'React Native', 'updated' => 'Il y a 3 jours', 'branches' => 2, 'url' => 'https://github.com/devenviron/mobile-app'],
            ['id' => 4, 'name' => 'devenviron-backend', 'description' => 'API Laravel',       'visibility' => 'private', 'stars' => 3,  'forks' => 0, 'lang' => 'PHP/Laravel',  'updated' => "À l'instant",    'branches' => 1, 'url' => 'https://github.com/devenviron/devenviron-backend'],
        ],
        'environments' => [
            ['id' => 1, 'name' => 'Développement', 'type' => 'dev',        'status' => 'running', 'url' => 'https://dev.example.com',     'version' => '1.3.0', 'last_deploy' => '2024-11-05', 'cpu' => 23, 'memory' => 45],
            ['id' => 2, 'name' => 'Staging',       'type' => 'staging',    'status' => 'running', 'url' => 'https://staging.example.com', 'version' => '1.2.5', 'last_deploy' => '2024-11-03', 'cpu' => 45, 'memory' => 62],
            ['id' => 3, 'name' => 'Production',    'type' => 'production', 'status' => 'running', 'url' => 'https://example.com',         'version' => '1.2.0', 'last_deploy' => '2024-10-28', 'cpu' => 67, 'memory' => 78],
        ],
        'pipeline' => [
            'status' => [
                'checkout' => 'completed',
                'tests'    => 'active',
                'build'    => 'pending',
                'deploy'   => 'pending',
            ],
            'logs' => [
                ['time' => '14:30:01', 'text' => 'Démarrage pipeline CI/CD v2.1.0',          'level' => 'info'],
                ['time' => '14:30:12', 'text' => 'Récupération depuis origin/main... ✓',      'level' => 'success'],
                ['time' => '14:31:05', 'text' => 'npm install (125 packages)... ✓',           'level' => 'success'],
                ['time' => '14:33:20', 'text' => 'Tests unitaires en cours...',               'level' => 'info'],
                ['time' => '14:35:44', 'text' => '152 tests passés — 0 échecs ✓',            'level' => 'success'],
                ['time' => '14:36:01', 'text' => 'Build en attente...',                       'level' => 'warning'],
            ],
        ],
        'activities' => [
            ['id' => 1, 'user' => 'Marie Dubois', 'action' => 'a poussé du code sur frontend-ecommerce', 'icon' => 'code-branch',  'time' => 'Il y a 15 min', 'color' => '#00c8ff'],
            ['id' => 2, 'user' => 'Jean Martin',  'action' => 'a complété "Implémenter API REST"',        'icon' => 'check-circle', 'time' => 'Il y a 1h',     'color' => '#00ff88'],
            ['id' => 3, 'user' => 'Admin User',   'action' => 'a déployé v1.3.0 en développement',        'icon' => 'rocket',       'time' => 'Il y a 3h',     'color' => '#ff6b35'],
        ],
        'chat_messages' => [
            ['id' => 1, 'sender' => 'Marie Dubois', 'avatar' => 'MD', 'message' => 'Bonjour! Les tests v1.3 sont prêts 🎉', 'time' => '14:20', 'type' => 'received', 'channel' => 'general'],
            ['id' => 2, 'sender' => 'Admin User',   'avatar' => 'AU', 'message' => 'Super! Je prépare le déploiement.',     'time' => '14:22', 'type' => 'sent',     'channel' => 'general'],
            ['id' => 3, 'sender' => 'Jean Martin',  'avatar' => 'JM', 'message' => "N'oubliez pas la documentation.",        'time' => '14:25', 'type' => 'received', 'channel' => 'general'],
        ],
        'notifications' => [
            ['id' => 1, 'type' => 'task',    'message' => 'Nouvelle tâche assignée : Corriger bug login',     'read' => false, 'time' => '10 min'],
            ['id' => 2, 'type' => 'deploy',  'message' => 'Déploiement v1.3.0 terminé avec succès',           'read' => false, 'time' => '3h'],
            ['id' => 3, 'type' => 'mention', 'message' => 'Marie Dubois vous a mentionné dans #général',      'read' => true,  'time' => '1 jour'],
        ],
        'tokens' => [], // stockage des JWT mock
    ];

    // ── Lecture ──────────────────────────────────────────────────
    public static function get(string $collection): array
    {
        $data = self::load();
        return $data[$collection] ?? [];
    }

    public static function find(string $collection, int $id): ?array
    {
        foreach (self::get($collection) as $item) {
            if ((int)($item['id'] ?? 0) === $id) return $item;
        }
        return null;
    }

    public static function findBy(string $collection, string $field, mixed $value): ?array
    {
        foreach (self::get($collection) as $item) {
            if (($item[$field] ?? null) === $value) return $item;
        }
        return null;
    }

    // ── Écriture ─────────────────────────────────────────────────
    public static function insert(string $collection, array $item): array
    {
        $data = self::load();
        $items = $data[$collection] ?? [];
        // Auto-incrément
        $maxId = 0;
        foreach ($items as $i) { if ((int)($i['id'] ?? 0) > $maxId) $maxId = (int)$i['id']; }
        $item['id'] = $maxId + 1;
        $item['created_at'] = now()->toISOString();
        $items[] = $item;
        $data[$collection] = $items;
        self::save($data);
        return $item;
    }

    public static function update(string $collection, int $id, array $updates): ?array
    {
        $data = self::load();
        $items = $data[$collection] ?? [];
        foreach ($items as &$item) {
            if ((int)($item['id'] ?? 0) === $id) {
                $item = array_merge($item, $updates);
                $item['updated_at'] = now()->toISOString();
                $data[$collection] = $items;
                self::save($data);
                return $item;
            }
        }
        return null;
    }

    public static function delete(string $collection, int $id): bool
    {
        $data = self::load();
        $items = $data[$collection] ?? [];
        $filtered = array_filter($items, fn($i) => (int)($i['id'] ?? 0) !== $id);
        if (count($filtered) === count($items)) return false;
        $data[$collection] = array_values($filtered);
        self::save($data);
        return true;
    }

    public static function setNested(string $key, array $value): void
    {
        $data = self::load();
        $data[$key] = $value;
        self::save($data);
    }

    // ── Persistence JSON ─────────────────────────────────────────
    private static function load(): array
    {
        if (!file_exists(self::$storagePath)) {
            self::save(self::$defaults);
            return self::$defaults;
        }
        $content = file_get_contents(self::$storagePath);
        $decoded = json_decode($content, true);
        return $decoded ?: self::$defaults;
    }

    private static function save(array $data): void
    {
        $dir = dirname(self::$storagePath);
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        file_put_contents(self::$storagePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    public static function reset(): void
    {
        self::save(self::$defaults);
    }
}
