---
tags:
  - module/informations
  - documentation
---

# Documentation du module Informations

Documentation technique des actualités et informations publiées sur le site. Les images décrites ici sont les illustrations attachées à une information ; ce dossier ne documente pas le module général de photothèque.

## Notes

- [[Architecture]] — composants, responsabilités et parcours des requêtes.
- [[Publication-et-affichage]] — création, validation, visibilité, rendu du fil d’actualités.
- [[Techniques-et-securite]] — explications des techniques de code et des protections, avec leur raison d’être.
- [[Donnees-et-fichiers]] — tables SQL, images, PDF, expiration et opérations de maintenance.

## Points d’entrée dans le code

| Fonction | Fichier |
|---|---|
| Règles métier | [`src/ClasseMetier/Information.php`](../../src/ClasseMetier/Information.php) |
| Consultation de toutes les actualités | [`public/information/index.php`](../../public/information/index.php) |
| Rendu des cartes | [`public/information/afficher.js`](../../public/information/afficher.js) |
| Administration | [`public/administration/information/index.php`](../../public/administration/information/index.php) |
| Base SQL | [`sql/information/create.sql`](../../sql/information/create.sql) |
