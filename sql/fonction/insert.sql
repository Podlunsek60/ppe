use ppe;

-- Ajoute ou actualise les fonctions sans supprimer les autres modules existants.
insert into fonction (repertoire, nom)
values
    ('epreuve', '📅 4 saisons'),
    ('membre', '👥 Membres'),
    ('information', '📰 Informations'),
    ('photoinformation', '🖼️ Photos')
on duplicate key update nom = values(nom);
