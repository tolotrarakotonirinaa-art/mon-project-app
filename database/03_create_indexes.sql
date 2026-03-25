-- ══════════════════════════════════════════════════════════
--  DevEnviron 4D — Fichier 03 : Index de performance
--  Les index accélèrent les recherches et filtres
-- ══════════════════════════════════════════════════════════

\c devenviron

-- ── Index sur users ──────────────────────────────────────
-- Recherche par email (login)
CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

-- Filtrer par rôle
CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

-- ── Index sur projects ───────────────────────────────────
-- Filtrer par statut
CREATE INDEX IF NOT EXISTS idx_projects_status
    ON projects(status);

-- Trier par date de création
CREATE INDEX IF NOT EXISTS idx_projects_created_at
    ON projects(created_at DESC);

-- Recherche par créateur
CREATE INDEX IF NOT EXISTS idx_projects_created_by
    ON projects(created_by);

-- ── Index sur tasks ──────────────────────────────────────
-- Filtrer par statut (Kanban)
CREATE INDEX IF NOT EXISTS idx_tasks_status
    ON tasks(status);

-- Filtrer par priorité
CREATE INDEX IF NOT EXISTS idx_tasks_priority
    ON tasks(priority);

-- Filtrer par projet
CREATE INDEX IF NOT EXISTS idx_tasks_project
    ON tasks(project);

-- Filtrer par assigné
CREATE INDEX IF NOT EXISTS idx_tasks_assignee
    ON tasks(assignee);

-- Combiné statut + priorité
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority
    ON tasks(status, priority);

-- ── Index sur repositories ───────────────────────────────
-- Filtrer par visibilité
CREATE INDEX IF NOT EXISTS idx_repos_visibility
    ON repositories(visibility);

-- Trier par étoiles
CREATE INDEX IF NOT EXISTS idx_repos_stars
    ON repositories(stars DESC);

-- ── Index sur environments ───────────────────────────────
-- Filtrer par type
CREATE INDEX IF NOT EXISTS idx_envs_type
    ON environments(type);

-- Filtrer par statut
CREATE INDEX IF NOT EXISTS idx_envs_status
    ON environments(status);

-- ── Index sur pipeline_logs ──────────────────────────────
-- Trier par date
CREATE INDEX IF NOT EXISTS idx_pipeline_logs_created
    ON pipeline_logs(created_at DESC);

-- Filtrer par niveau
CREATE INDEX IF NOT EXISTS idx_pipeline_logs_level
    ON pipeline_logs(level);

-- ── Index sur chat_messages ──────────────────────────────
-- Filtrer par canal
CREATE INDEX IF NOT EXISTS idx_chat_channel
    ON chat_messages(channel);

-- Trier par date (messages récents en premier)
CREATE INDEX IF NOT EXISTS idx_chat_created
    ON chat_messages(created_at DESC);

-- ── Index sur activities ─────────────────────────────────
-- Trier par date (activités récentes en premier)
CREATE INDEX IF NOT EXISTS idx_activities_created
    ON activities(created_at DESC);

-- ── Index sur notifications ──────────────────────────────
-- Filtrer non lues par utilisateur
CREATE INDEX IF NOT EXISTS idx_notifs_user_unread
    ON notifications(user_id, read);

-- Trier par date
CREATE INDEX IF NOT EXISTS idx_notifs_created
    ON notifications(created_at DESC);

-- ══════════════════════════════════════════════════════════
--  Vérification
-- ══════════════════════════════════════════════════════════
SELECT
    indexname  AS "Index créé",
    tablename  AS "Sur la table"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
