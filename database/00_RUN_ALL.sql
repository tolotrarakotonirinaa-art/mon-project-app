-- ══════════════════════════════════════════════════════════
--  DevEnviron 4D — Script MAÎTRE
--  Exécute tout dans le bon ordre automatiquement
--
--  UTILISATION :
--  psql -U postgres -f 00_RUN_ALL.sql
-- ══════════════════════════════════════════════════════════

\echo ''
\echo '╔══════════════════════════════════════════╗'
\echo '║     DevEnviron 4D — Setup Base de données ║'
\echo '╚══════════════════════════════════════════╝'
\echo ''

-- Étape 1 : Créer la base de données
\echo '📦 Étape 1/5 : Création de la base de données...'
\i 01_create_database.sql
\echo '✅ Base de données créée.'
\echo ''

-- Étape 2 : Créer les tables
\echo '🗂️  Étape 2/5 : Création des tables...'
\i 02_create_tables.sql
\echo '✅ Tables créées.'
\echo ''

-- Étape 3 : Créer les index
\echo '⚡ Étape 3/5 : Création des index de performance...'
\i 03_create_indexes.sql
\echo '✅ Index créés.'
\echo ''

-- Étape 4 : Créer les triggers
\echo '🔄 Étape 4/5 : Création des triggers...'
\i 04_create_triggers.sql
\echo '✅ Triggers créés.'
\echo ''

-- Étape 5 : Insérer les données
\echo '🌱 Étape 5/5 : Insertion des données initiales...'
\i 05_seed_data.sql
\echo '✅ Données insérées.'
\echo ''

\echo '══════════════════════════════════════════'
\echo '🎉 Base de données DevEnviron 4D PRÊTE !'
\echo '   Connectez-vous : psql -U postgres -d devenviron'
\echo '══════════════════════════════════════════'
