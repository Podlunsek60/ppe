-- ATTENTION : ce script supprime puis recrée toute la base ppe.
-- À réserver à une première installation ; pour une mise à jour, lancer seulement les scripts du module concerné.
SET default_storage_engine=InnoDb;
--

set foreign_key_checks = 0;
Drop database if exists ppe;
set foreign_key_checks = 1;

create database ppe
    character set utf8mb4
    collate utf8mb4_unicode_ci;

-- ordre de lancement des scripts : create, declencheur, test et insert

-- 1. user.sql
-- 2. répertoire epreuve
-- 3. répertoire  fonction
-- 4. répertoire membre
-- 5. répertoire administrateur
-- 6. répertoire droit
-- 7. répertoire information (create.sql puis insert.sql ; permission.sql pour accorder le droit à l'administrateur initial ; update.sql seulement pour une base existante à migrer)
-- 8. répertoire resultat (un seul script resultat.sql pour les 3 tables)
