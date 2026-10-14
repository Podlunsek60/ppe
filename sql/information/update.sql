USE ppe;

-- À exécuter une seule fois sur une base déjà installée avant l'ajout des illustrations.
ALTER TABLE information
    ADD COLUMN illustration VARCHAR(255) NULL AFTER description;
