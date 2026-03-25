-- ══════════════════════════════════════════════════════════
--  DevEnviron 4D — Fichier 01 : Création de la base
--  À exécuter en premier, connecté en tant que "postgres"
-- ══════════════════════════════════════════════════════════

-- Supprimer la base si elle existe déjà (optionnel)
DROP DATABASE IF EXISTS devenviron;

-- Créer la base de données
CREATE DATABASE devenviron
    WITH
    OWNER      = postgres
    ENCODING   = 'UTF8'
    LC_COLLATE = 'French_France.1252'
    LC_CTYPE   = 'French_France.1252'
    TEMPLATE   = template0
    CONNECTION LIMIT = -1;

-- Commentaire sur la base
COMMENT ON DATABASE devenviron IS 'DevEnviron 4D — Plateforme SaaS de collaboration';
