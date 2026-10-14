USE ppe;

START TRANSACTION;

INSERT INTO information (titre, description, type, dateExpiration)
VALUES ('Information publique de test', '<p>Contenu public de test.</p>', 'publique', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
       ('Information privée de test', '<p>Contenu privé de test.</p>', 'privée', DATE_ADD(CURDATE(), INTERVAL 30 DAY));

SELECT idInformation, titre, type, dateExpiration
FROM information
WHERE titre IN ('Information publique de test', 'Information privée de test');

ROLLBACK;