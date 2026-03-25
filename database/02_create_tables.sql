-- ══════════════════════════════════════════════════════════
--  DevEnviron 4D — Fichier 02 : Création des tables
--  À exécuter APRÈS le fichier 01, connecté à "devenviron"
-- ══════════════════════════════════════════════════════════

-- Se connecter à la bonne base
\c devenviron

-- Activer les extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────
--  TABLE : users
--  Contient tous les utilisateurs de la plateforme
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(120)    NOT NULL,
    email       VARCHAR(180)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(20)     NOT NULL DEFAULT 'dev'
                                CHECK (role IN ('admin', 'dev', 'client')),
    avatar      VARCHAR(10),
    bio         TEXT,
    join_date   DATE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users          IS 'Utilisateurs de la plateforme DevEnviron';
COMMENT ON COLUMN users.role     IS 'admin = accès total, dev = accès dev, client = lecture seule';
COMMENT ON COLUMN users.avatar   IS 'Initiales ex: AU, JD, MD';
COMMENT ON COLUMN users.password IS 'Hashé avec bcrypt côté backend';

-- ──────────────────────────────────────────────────────────
--  TABLE : projects
--  Projets de développement
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(120)    NOT NULL,
    description TEXT,
    status      VARCHAR(20)     NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'pending', 'completed')),
    progress    SMALLINT        NOT NULL DEFAULT 0
                                CHECK (progress BETWEEN 0 AND 100),
    start_date  DATE,
    end_date    DATE,
    color       VARCHAR(20)     DEFAULT '#00c8ff',
    team        JSONB           DEFAULT '[]',
    tags        JSONB           DEFAULT '[]',
    created_by  INTEGER         REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  projects            IS 'Projets de développement';
COMMENT ON COLUMN projects.progress   IS 'Pourcentage de progression 0-100';
COMMENT ON COLUMN projects.team       IS 'Tableau JSON des initiales des membres ex: ["JD","MD"]';
COMMENT ON COLUMN projects.tags       IS 'Technologies ex: ["React","Node.js"]';
COMMENT ON COLUMN projects.color      IS 'Couleur hex pour lUI ex: #00c8ff';

-- ──────────────────────────────────────────────────────────
--  TABLE : tasks
--  Tâches du tableau Kanban
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id          SERIAL          PRIMARY KEY,
    title       VARCHAR(200)    NOT NULL,
    description TEXT,
    project     VARCHAR(120)    NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'todo'
                                CHECK (status IN ('todo', 'inprogress', 'done')),
    priority    VARCHAR(20)     NOT NULL DEFAULT 'medium'
                                CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assignee    VARCHAR(10),
    due_date    DATE,
    created_by  INTEGER         REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  tasks           IS 'Tâches du tableau Kanban';
COMMENT ON COLUMN tasks.status    IS 'todo = à faire, inprogress = en cours, done = terminé';
COMMENT ON COLUMN tasks.priority  IS 'low / medium / high / urgent';
COMMENT ON COLUMN tasks.assignee  IS 'Initiales du membre assigné ex: JD';
COMMENT ON COLUMN tasks.project   IS 'Nom du projet associé';

-- ──────────────────────────────────────────────────────────
--  TABLE : repositories
--  Dépôts Git du projet
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS repositories (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    description TEXT,
    visibility  VARCHAR(10)     NOT NULL DEFAULT 'private'
                                CHECK (visibility IN ('public', 'private')),
    lang        VARCHAR(60)     DEFAULT 'JavaScript',
    url         VARCHAR(500),
    stars       INTEGER         NOT NULL DEFAULT 0 CHECK (stars >= 0),
    forks       INTEGER         NOT NULL DEFAULT 0 CHECK (forks >= 0),
    branches    INTEGER         NOT NULL DEFAULT 1 CHECK (branches >= 1),
    created_by  INTEGER         REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  repositories            IS 'Dépôts Git de la plateforme';
COMMENT ON COLUMN repositories.visibility IS 'public = visible par tous, private = accès restreint';

-- ──────────────────────────────────────────────────────────
--  TABLE : environments
--  Environnements de déploiement (Dev / Staging / Production)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS environments (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(80)     NOT NULL,
    type        VARCHAR(20)     NOT NULL DEFAULT 'dev'
                                CHECK (type IN ('dev', 'staging', 'production')),
    status      VARCHAR(20)     NOT NULL DEFAULT 'stopped'
                                CHECK (status IN ('running', 'stopped', 'deploying', 'error')),
    url         VARCHAR(500),
    version     VARCHAR(30)     DEFAULT '1.0.0',
    last_deploy DATE,
    cpu         SMALLINT        DEFAULT 0 CHECK (cpu BETWEEN 0 AND 100),
    memory      SMALLINT        DEFAULT 0 CHECK (memory BETWEEN 0 AND 100),
    created_by  INTEGER         REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  environments        IS 'Environnements de déploiement';
COMMENT ON COLUMN environments.cpu    IS 'Utilisation CPU en pourcentage 0-100';
COMMENT ON COLUMN environments.memory IS 'Utilisation RAM en pourcentage 0-100';
COMMENT ON COLUMN environments.type   IS 'dev / staging / production';

-- ──────────────────────────────────────────────────────────
--  TABLE : pipeline_status
--  État courant du pipeline CI/CD (une seule ligne)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_status (
    id          SERIAL          PRIMARY KEY,
    checkout    VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                CHECK (checkout IN ('pending', 'active', 'completed', 'failed')),
    tests       VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                CHECK (tests    IN ('pending', 'active', 'completed', 'failed')),
    build       VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                CHECK (build    IN ('pending', 'active', 'completed', 'failed')),
    deploy      VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                CHECK (deploy   IN ('pending', 'active', 'completed', 'failed')),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE pipeline_status IS 'État courant des 4 étapes du pipeline CI/CD';

-- ──────────────────────────────────────────────────────────
--  TABLE : pipeline_logs
--  Historique des logs du pipeline
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_logs (
    id           SERIAL          PRIMARY KEY,
    time         VARCHAR(10)     NOT NULL,
    text         TEXT            NOT NULL,
    level        VARCHAR(10)     NOT NULL DEFAULT 'info'
                                 CHECK (level IN ('info', 'success', 'warning', 'error')),
    triggered_by INTEGER         REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  pipeline_logs       IS 'Logs d execution du pipeline CI/CD';
COMMENT ON COLUMN pipeline_logs.level IS 'info / success / warning / error';

-- ──────────────────────────────────────────────────────────
--  TABLE : chat_messages
--  Messages de la messagerie d'équipe
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id          SERIAL          PRIMARY KEY,
    sender      VARCHAR(120)    NOT NULL,
    avatar      VARCHAR(10),
    message     TEXT            NOT NULL,
    channel     VARCHAR(60)     NOT NULL DEFAULT 'general',
    time        VARCHAR(10),
    user_id     INTEGER         REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  chat_messages         IS 'Messages de la messagerie équipe';
COMMENT ON COLUMN chat_messages.channel IS 'Canal ex: general, dev, design';

-- ──────────────────────────────────────────────────────────
--  TABLE : activities
--  Fil d'activité affiché sur le tableau de bord
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
    id          SERIAL          PRIMARY KEY,
    "user"      VARCHAR(120),
    action      TEXT            NOT NULL,
    icon        VARCHAR(60)     DEFAULT 'user',
    color       VARCHAR(20)     DEFAULT '#00c8ff',
    time        VARCHAR(60),
    user_id     INTEGER         REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE activities IS 'Fil d activite du tableau de bord';

-- ──────────────────────────────────────────────────────────
--  TABLE : notifications
--  Notifications par utilisateur
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          SERIAL          PRIMARY KEY,
    type        VARCHAR(50)     NOT NULL DEFAULT 'info',
    message     TEXT            NOT NULL,
    read        BOOLEAN         NOT NULL DEFAULT FALSE,
    time        VARCHAR(60),
    user_id     INTEGER         REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  notifications      IS 'Notifications par utilisateur';
COMMENT ON COLUMN notifications.type IS 'task / deploy / mention / info';
COMMENT ON COLUMN notifications.read IS 'true = lue, false = non lue';

-- ══════════════════════════════════════════════════════════
--  Confirmation
-- ══════════════════════════════════════════════════════════
SELECT
    table_name    AS "Table créée",
    'OK'          AS "Statut"
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type   = 'BASE TABLE'
ORDER BY table_name;
