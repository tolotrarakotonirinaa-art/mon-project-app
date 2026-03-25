-- ══════════════════════════════════════════════════════════
--  DevEnviron 4D — Fichier 06 : Requêtes utiles
--  À utiliser dans pgAdmin pour vérifier et gérer la BDD
-- ══════════════════════════════════════════════════════════

\c devenviron

-- ──────────────────────────────────────────────────────────
--  VÉRIFICATIONS GÉNÉRALES
-- ──────────────────────────────────────────────────────────

-- Voir toutes les tables et leur nombre de lignes
SELECT
    relname             AS "Table",
    n_live_tup          AS "Nb lignes",
    pg_size_pretty(pg_total_relation_size(oid)) AS "Taille"
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;


-- Voir tous les utilisateurs
SELECT
    id, name, email, role, avatar, join_date, created_at
FROM users
ORDER BY id;


-- Voir tous les projets
SELECT
    p.id,
    p.name,
    p.status,
    p.progress || '%' AS avancement,
    p.end_date,
    u.name            AS "créé par"
FROM projects p
LEFT JOIN users u ON u.id = p.created_by
ORDER BY p.id;


-- Voir toutes les tâches du Kanban
SELECT
    t.id,
    t.title,
    t.project,
    t.status,
    t.priority,
    t.assignee,
    t.due_date
FROM tasks t
ORDER BY
    CASE t.status
        WHEN 'todo'       THEN 1
        WHEN 'inprogress' THEN 2
        WHEN 'done'       THEN 3
    END,
    CASE t.priority
        WHEN 'urgent' THEN 1
        WHEN 'high'   THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low'    THEN 4
    END;


-- Statistiques globales des tâches
SELECT
    status                  AS "Statut",
    COUNT(*)                AS "Nombre",
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) || '%' AS "Pourcentage"
FROM tasks
GROUP BY status
ORDER BY
    CASE status
        WHEN 'todo'       THEN 1
        WHEN 'inprogress' THEN 2
        WHEN 'done'       THEN 3
    END;


-- Tâches par priorité
SELECT
    priority                AS "Priorité",
    COUNT(*)                AS "Nombre",
    COUNT(*) FILTER (WHERE status = 'done') AS "Terminées"
FROM tasks
GROUP BY priority
ORDER BY
    CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high'   THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low'    THEN 4
    END;


-- Voir les environnements et leurs métriques
SELECT
    name,
    type,
    status,
    version,
    last_deploy,
    cpu    || '%' AS cpu,
    memory || '%' AS ram
FROM environments
ORDER BY
    CASE type
        WHEN 'dev'        THEN 1
        WHEN 'staging'    THEN 2
        WHEN 'production' THEN 3
    END;


-- Voir les dépôts Git
SELECT
    name, visibility, lang, stars, forks, branches, created_at
FROM repositories
ORDER BY stars DESC;


-- Voir les messages du chat (50 derniers)
SELECT
    cm.id,
    cm.sender,
    cm.message,
    cm.channel,
    cm.time,
    cm.created_at
FROM chat_messages cm
ORDER BY cm.created_at DESC
LIMIT 50;


-- Voir les notifications non lues
SELECT
    n.id,
    n.type,
    n.message,
    n.time,
    u.name AS "pour l'utilisateur"
FROM notifications n
LEFT JOIN users u ON u.id = n.user_id
WHERE n.read = FALSE
ORDER BY n.created_at DESC;


-- Voir les activités récentes
SELECT
    a.id,
    a."user",
    a.action,
    a.time,
    a.created_at
FROM activities a
ORDER BY a.created_at DESC
LIMIT 10;


-- ──────────────────────────────────────────────────────────
--  REQUÊTES DE GESTION
-- ──────────────────────────────────────────────────────────

-- Changer le rôle d'un utilisateur
-- UPDATE users SET role = 'admin' WHERE email = 'john.doe@example.com';


-- Marquer toutes les notifications comme lues
-- UPDATE notifications SET read = TRUE WHERE user_id = 1;


-- Déplacer une tâche dans le Kanban
-- UPDATE tasks SET status = 'done' WHERE id = 1;


-- Mettre à jour la progression d'un projet
-- UPDATE projects SET progress = 80 WHERE id = 1;


-- Supprimer un utilisateur (toutes ses données seront effacées en cascade)
-- DELETE FROM users WHERE id = 5;


-- Réinitialiser toutes les données (ATTENTION : irréversible !)
-- TRUNCATE notifications, activities, chat_messages,
--          pipeline_logs, pipeline_status,
--          environments, repositories, tasks, projects, users
-- RESTART IDENTITY CASCADE;


-- ──────────────────────────────────────────────────────────
--  STATISTIQUES AVANCÉES
-- ──────────────────────────────────────────────────────────

-- Tableau de bord complet en une seule requête
SELECT
    (SELECT COUNT(*) FROM users)                                   AS "Total utilisateurs",
    (SELECT COUNT(*) FROM projects)                                AS "Total projets",
    (SELECT COUNT(*) FROM projects WHERE status = 'active')        AS "Projets actifs",
    (SELECT COUNT(*) FROM tasks)                                   AS "Total tâches",
    (SELECT COUNT(*) FROM tasks WHERE status = 'done')             AS "Tâches terminées",
    (SELECT COUNT(*) FROM tasks WHERE status = 'inprogress')       AS "Tâches en cours",
    (SELECT COUNT(*) FROM repositories)                            AS "Total dépôts",
    (SELECT COUNT(*) FROM notifications WHERE read = FALSE)        AS "Notifs non lues",
    (SELECT ROUND(AVG(progress), 1) FROM projects)                 AS "Progression moy. projets %";


-- Progression des projets
SELECT
    name,
    status,
    progress || '%'  AS "Avancement",
    end_date         AS "Échéance",
    CASE
        WHEN end_date < CURRENT_DATE AND status != 'completed' THEN '⚠️ En retard'
        WHEN end_date <= CURRENT_DATE + 7                       THEN '⏰ Bientôt'
        ELSE '✅ Dans les temps'
    END              AS "Alerte"
FROM projects
ORDER BY progress DESC;
