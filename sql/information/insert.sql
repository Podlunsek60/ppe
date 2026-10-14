USE ppe;

-- Exemples affichés sur les pages d'accueil après l'installation.
INSERT INTO information (titre, description, type, dateExpiration)
SELECT 'Bienvenue dans les informations du club',
       '<p>Les actualités du club et les documents associés seront publiés ici.</p>',
       'publique',
       DATE_ADD(CURDATE(), INTERVAL 1 YEAR)
WHERE NOT EXISTS (
    SELECT 1
    FROM information
    WHERE titre = 'Bienvenue dans les informations du club'
);

INSERT INTO information (titre, description, type, dateExpiration)
SELECT 'Inscriptions ouvertes pour la prochaine saison',
       '<p>Les inscriptions pour la prochaine saison sont ouvertes. <a href="/membre">Connectez-vous à votre espace membre</a> pour mettre à jour votre dossier.</p>',
       'publique',
       DATE_ADD(CURDATE(), INTERVAL 90 DAY)
WHERE NOT EXISTS (
    SELECT 1
    FROM information
    WHERE titre = 'Inscriptions ouvertes pour la prochaine saison'
);

INSERT INTO information (titre, description, type, dateExpiration)
SELECT 'Rappel : entraînement collectif samedi',
       '<p>Rendez-vous samedi à 9 h au club pour un entraînement collectif. Pensez à apporter votre équipement.</p>',
       'publique',
       DATE_ADD(CURDATE(), INTERVAL 30 DAY)
WHERE NOT EXISTS (
    SELECT 1
    FROM information
    WHERE titre = 'Rappel : entraînement collectif samedi'
);

INSERT INTO information (titre, description, type, dateExpiration)
SELECT 'Information réservée aux membres : réunion du club',
       '<p>La prochaine réunion du club aura lieu vendredi à 18 h dans la salle principale. Merci de confirmer votre présence auprès du bureau.</p>',
       'privée',
       DATE_ADD(CURDATE(), INTERVAL 60 DAY)
WHERE NOT EXISTS (
    SELECT 1
    FROM information
    WHERE titre = 'Information réservée aux membres : réunion du club'
);

INSERT INTO information (titre, description, type, dateExpiration)
SELECT 'Résultats et photos de la dernière rencontre',
       '<p>Merci à tous les participants pour cette belle journée. Les résultats et les photos seront ajoutés dans les prochains jours.</p>',
       'publique',
       DATE_ADD(CURDATE(), INTERVAL 120 DAY)
WHERE NOT EXISTS (
    SELECT 1
    FROM information
    WHERE titre = 'Résultats et photos de la dernière rencontre'
);