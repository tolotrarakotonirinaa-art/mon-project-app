-- ══════════════════════════════════════════════════════════
--  DevEnviron 4D — Fichier 05 : Données initiales (Seed)
--  Remplit toutes les tables avec des données de démonstration
-- ══════════════════════════════════════════════════════════

\c devenviron

-- Désactiver les contraintes temporairement pour l'insertion
SET session_replication_role = 'replica';

-- Vider les tables (ordre important à cause des FK)
TRUNCATE notifications, activities, chat_messages,
         pipeline_logs, pipeline_status,
         environments, repositories, tasks, projects, users
RESTART IDENTITY CASCADE;

-- Réactiver les contraintes
SET session_replication_role = 'DEFAULT';


-- ══════════════════════════════════════════════════════════
--  1. USERS — 5 utilisateurs (1 admin, 3 dev, 1 client)
--  Note: les mots de passe sont hashés avec bcrypt (password123)
-- ══════════════════════════════════════════════════════════
INSERT INTO users (id, name, email, password, role, avatar, bio, join_date) VALUES

(1, 'Admin User',
 'admin@devenviron.com',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'admin', 'AU',
 'Administrateur de la plateforme DevEnviron 4D',
 '2024-01-15'),

(2, 'John Doe',
 'john.doe@example.com',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'dev', 'JD',
 'Développeur fullstack React / Node.js',
 '2024-03-10'),

(3, 'Marie Dubois',
 'marie.dubois@example.com',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'dev', 'MD',
 'Développeuse frontend spécialisée React et TypeScript',
 '2024-04-22'),

(4, 'Jean Martin',
 'jean.martin@example.com',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'dev', 'JM',
 'Ingénieur backend Node.js / MongoDB / PostgreSQL',
 '2024-05-05'),

(5, 'Sophie Lambert',
 'sophie.lambert@example.com',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'client', 'SL',
 'Chef de projet, vision produit et relation client',
 '2024-06-18');

-- Resynchroniser la séquence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));


-- ══════════════════════════════════════════════════════════
--  2. PROJECTS — 4 projets
-- ══════════════════════════════════════════════════════════
INSERT INTO projects (id, name, description, status, progress, start_date, end_date, color, team, tags, created_by) VALUES

(1,
 'Site E-commerce',
 'Interface React + Node.js pour boutique en ligne avec paiement Stripe intégré',
 'active', 75,
 '2024-10-01', '2024-12-15',
 '#00c8ff',
 '["JD", "MD", "SL"]',
 '["React", "Node.js", "MongoDB", "Stripe"]',
 1),

(2,
 'API de paiement',
 'API REST sécurisée avec Node.js, MongoDB et intégration Stripe complète',
 'active', 60,
 '2024-09-15', '2024-11-30',
 '#7c3aed',
 '["JM", "AU"]',
 '["Node.js", "Stripe", "MongoDB", "JWT"]',
 1),

(3,
 'App Mobile',
 'Application mobile cross-platform React Native pour iOS et Android',
 'pending', 20,
 '2024-11-01', '2025-02-28',
 '#00ff88',
 '["JD", "SL"]',
 '["React Native", "Expo", "TypeScript"]',
 1),

(4,
 'Dashboard Analytics',
 'Dashboard temps réel avec WebSocket, graphiques D3.js et alertes automatiques',
 'active', 45,
 '2024-10-15', '2025-01-30',
 '#ff6b35',
 '["MD", "JM"]',
 '["React", "WebSocket", "D3.js", "Redis"]',
 1);

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));


-- ══════════════════════════════════════════════════════════
--  3. TASKS — 7 tâches réparties dans les 3 colonnes Kanban
-- ══════════════════════════════════════════════════════════
INSERT INTO tasks (id, title, description, project, status, priority, assignee, due_date, created_by) VALUES

(1,
 'Corriger bug login',
 'Le bouton de connexion ne répond pas sur mobile Safari. Reproduire et corriger.',
 'Site E-commerce', 'todo', 'high', 'JD',
 '2024-11-10', 1),

(2,
 'Implémenter API REST',
 'Créer les endpoints CRUD pour la gestion des paiements et remboursements.',
 'API de paiement', 'inprogress', 'medium', 'JM',
 '2024-11-15', 1),

(3,
 'Tests unitaires',
 'Écrire les tests Jest pour tous les composants React du module produit.',
 'App Mobile', 'done', 'low', 'SL',
 '2024-11-05', 1),

(4,
 'Design responsive',
 'Adapter toutes les pages pour mobile (320px) et tablette (768px).',
 'Site E-commerce', 'todo', 'medium', 'MD',
 '2024-11-12', 1),

(5,
 'Documentation API',
 'Générer la documentation Swagger et rédiger le README complet.',
 'API de paiement', 'inprogress', 'low', 'JD',
 '2024-11-20', 1),

(6,
 'Config CI/CD',
 'Configurer GitHub Actions pour les tests automatiques et le déploiement.',
 'App Mobile', 'todo', 'high', 'AU',
 '2024-11-08', 1),

(7,
 'Optimiser requêtes BDD',
 'Ajouter les index manquants et mettre en cache les requêtes Redis.',
 'Dashboard Analytics', 'done', 'high', 'JM',
 '2024-11-01', 1);

SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));


-- ══════════════════════════════════════════════════════════
--  4. REPOSITORIES — 4 dépôts Git
-- ══════════════════════════════════════════════════════════
INSERT INTO repositories (id, name, description, visibility, lang, url, stars, forks, branches, created_by) VALUES

(1,
 'frontend-ecommerce',
 'Interface React avec TypeScript pour la boutique e-commerce',
 'public', 'JavaScript',
 'https://github.com/devenviron/frontend-ecommerce',
 12, 3, 4, 1),

(2,
 'backend-api',
 'API RESTful Node.js avec Express et MongoDB',
 'private', 'Node.js',
 'https://github.com/devenviron/backend-api',
 8, 1, 3, 1),

(3,
 'mobile-app',
 'Application mobile React Native avec Expo',
 'private', 'React Native',
 'https://github.com/devenviron/mobile-app',
 5, 0, 2, 1),

(4,
 'devenviron-backend',
 'API Laravel PHP pour la plateforme DevEnviron',
 'private', 'PHP / Laravel',
 'https://github.com/devenviron/devenviron-backend',
 3, 0, 1, 1);

SELECT setval('repositories_id_seq', (SELECT MAX(id) FROM repositories));


-- ══════════════════════════════════════════════════════════
--  5. ENVIRONMENTS — 3 environnements
-- ══════════════════════════════════════════════════════════
INSERT INTO environments (id, name, type, status, url, version, last_deploy, cpu, memory, created_by) VALUES

(1,
 'Développement',
 'dev', 'running',
 'https://dev.example.com',
 '1.3.0', '2024-11-05',
 23, 45, 1),

(2,
 'Staging',
 'staging', 'running',
 'https://staging.example.com',
 '1.2.5', '2024-11-03',
 45, 62, 1),

(3,
 'Production',
 'production', 'running',
 'https://example.com',
 '1.2.0', '2024-10-28',
 67, 78, 1);

SELECT setval('environments_id_seq', (SELECT MAX(id) FROM environments));


-- ══════════════════════════════════════════════════════════
--  6. PIPELINE STATUS — État courant
-- ══════════════════════════════════════════════════════════
INSERT INTO pipeline_status (id, checkout, tests, build, deploy) VALUES
(1, 'completed', 'active', 'pending', 'pending');

SELECT setval('pipeline_status_id_seq', 1);


-- ══════════════════════════════════════════════════════════
--  7. PIPELINE LOGS — Historique
-- ══════════════════════════════════════════════════════════
INSERT INTO pipeline_logs (time, text, level, triggered_by) VALUES
('14:30:01', 'Démarrage pipeline CI/CD v2.1.0',          'info',    1),
('14:30:12', 'Récupération depuis origin/main... ✓',      'success', 1),
('14:31:05', 'npm install (125 packages)... ✓',           'success', 1),
('14:33:20', 'Tests unitaires en cours...',               'info',    1),
('14:35:44', '152 tests passés — 0 échecs ✓',            'success', 1),
('14:36:01', 'Build production en attente...',            'warning', 1);


-- ══════════════════════════════════════════════════════════
--  8. CHAT MESSAGES — Conversation initiale
-- ══════════════════════════════════════════════════════════
INSERT INTO chat_messages (sender, avatar, message, channel, time, user_id) VALUES
('Marie Dubois', 'MD', 'Bonjour ! Les tests v1.3 sont prêts 🎉',   'general', '14:20', 3),
('Admin User',   'AU', 'Super ! Je prépare le déploiement.',         'general', '14:22', 1),
('Jean Martin',  'JM', 'N''oubliez pas la documentation API svp !', 'general', '14:25', 4),
('John Doe',     'JD', 'Je la prépare pour demain matin.',          'general', '14:27', 2),
('Sophie Lambert','SL', 'Parfait, le client attend avec impatience !','general', '14:30', 5);


-- ══════════════════════════════════════════════════════════
--  9. ACTIVITIES — Fil d'activité du dashboard
-- ══════════════════════════════════════════════════════════
INSERT INTO activities ("user", action, icon, color, time, user_id) VALUES
('Marie Dubois', 'a poussé du code sur frontend-ecommerce',   'code-branch',  '#00c8ff', 'Il y a 15 min', 3),
('Jean Martin',  'a complété "Implémenter API REST"',          'check-circle', '#00ff88', 'Il y a 1h',     4),
('Admin User',   'a déployé v1.3.0 en développement',          'rocket',       '#ff6b35', 'Il y a 3h',     1),
('John Doe',     'a créé la tâche "Config CI/CD"',             'plus-circle',  '#7c3aed', 'Il y a 4h',     2),
('Marie Dubois', 'a ouvert le projet "App Mobile"',            'folder-open',  '#00ff88', 'Il y a 6h',     3);


-- ══════════════════════════════════════════════════════════
--  10. NOTIFICATIONS — Notifications de l'admin
-- ══════════════════════════════════════════════════════════
INSERT INTO notifications (type, message, read, time, user_id) VALUES
('task',    'Nouvelle tâche assignée : Corriger bug login',         FALSE, 'Il y a 10 min', 1),
('deploy',  'Déploiement v1.3.0 en développement terminé ✓',        FALSE, 'Il y a 3h',     1),
('mention', 'Marie Dubois vous a mentionné dans #général',          TRUE,  'Il y a 1 jour', 1),
('task',    'Tâche "Config CI/CD" est maintenant haute priorité',   FALSE, 'Il y a 5h',     2),
('deploy',  'Staging synchronisé avec la branche main',             TRUE,  'Il y a 2 jours',1);


-- ══════════════════════════════════════════════════════════
--  Résumé final
-- ══════════════════════════════════════════════════════════
SELECT '✅ Données insérées avec succès !' AS message;

SELECT
    'users'          AS table_name, COUNT(*) AS nb_lignes FROM users         UNION ALL
SELECT 'projects',                               COUNT(*) FROM projects      UNION ALL
SELECT 'tasks',                                  COUNT(*) FROM tasks         UNION ALL
SELECT 'repositories',                           COUNT(*) FROM repositories  UNION ALL
SELECT 'environments',                           COUNT(*) FROM environments  UNION ALL
SELECT 'pipeline_status',                        COUNT(*) FROM pipeline_status UNION ALL
SELECT 'pipeline_logs',                          COUNT(*) FROM pipeline_logs UNION ALL
SELECT 'chat_messages',                          COUNT(*) FROM chat_messages UNION ALL
SELECT 'activities',                             COUNT(*) FROM activities    UNION ALL
SELECT 'notifications',                          COUNT(*) FROM notifications
ORDER BY table_name;
