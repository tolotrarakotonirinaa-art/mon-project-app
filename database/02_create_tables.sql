-- ══════════════════════════════════════════════════════════
--  DevEnviron 4D — Fichier 02 : Création des tables
--  À exécuter APRÈS le fichier 01, connecté à "devenviron"
-- ══════════════════════════════════════════════════════════

\c devenviron

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────
--  TABLE : users
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(120)    NOT NULL,
    email           VARCHAR(180)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'dev'
                                    CHECK (role IN ('admin', 'dev', 'client')),
    is_validated    BOOLEAN         NOT NULL DEFAULT FALSE,
    avatar          VARCHAR(10),
    bio             TEXT,
    join_date       DATE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN users.is_validated IS 'false = en attente validation admin, true = accès autorisé';
COMMENT ON COLUMN users.role         IS 'admin = accès total, dev = accès dev, client = lecture seule';