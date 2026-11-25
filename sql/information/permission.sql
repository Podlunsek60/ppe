USE ppe;

-- Enregistre le droit permettant de gérer les actualités et leurs PDF.
INSERT INTO fonction (repertoire, nom)
VALUES ('information', '📰 Informations')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO fonction (repertoire, nom)
VALUES ('photoinformation', '🖼️ Photos')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

-- Accorde ce droit à l'administrateur initial sans modifier les autres droits.
INSERT INTO droit (idAdministrateur, repertoire)
SELECT administrateur.id, fonction.repertoire
FROM administrateur
JOIN fonction ON fonction.repertoire = 'information'
WHERE administrateur.id = 1
ON DUPLICATE KEY UPDATE repertoire = VALUES(repertoire);

-- Autorise aussi l'administrateur initial à gérer la bibliothèque d'images réutilisables.
INSERT INTO droit (idAdministrateur, repertoire)
SELECT administrateur.id, fonction.repertoire
FROM administrateur
JOIN fonction ON fonction.repertoire = 'photoinformation'
WHERE administrateur.id = 1
ON DUPLICATE KEY UPDATE repertoire = VALUES(repertoire);
