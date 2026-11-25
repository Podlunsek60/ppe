---
tags:
  - documentation
  - technique
  - informations
---

# Guide technique — Informations et actualités

Ce guide décrit uniquement le module **Informations** : affichage des actualités, administration, illustrations, images insérées dans le texte et PDF. Il ne constitue pas une documentation générale du site PPE.

Pour les détails approfondis, voir les notes du [module Informations](../information/Index.md). Pour les procédures côté utilisateur, voir le [guide utilisateur des informations](../utilisateur/Guide.md).

## Périmètre et fichiers principaux

| Partie du module | Fichiers et dossiers | Rôle |
|---|---|---|
| Actualités sur l’accueil | `public/index.php`, `public/information/afficher.js` | Charge et affiche les cinq informations visibles les plus récentes |
| Liste publique | `public/information/index.php`, `index.html`, `index.js`, `afficher.js` | Affiche l’archive des informations visibles |
| Détail et téléchargement | `public/information/detail.php`, `afficherdocumentinformation.php` | Affiche une information et transmet un PDF après contrôle de visibilité |
| Administration des informations | `public/administration/information/` | Formulaire, aperçu, enregistrement et gestion des documents |
| Bibliothèque d’illustrations | `public/administration/photoinformation/` | Gestion des illustrations réutilisables |
| Règles métier et SQL | `src/ClasseMetier/Information.php`, `sql/information/` | Validation, visibilité, persistance et schéma du module |
| Configuration et stockage | `config/image.php`, `config/documentinformation.php`, `public/data/` | Limites d’envoi et fichiers associés aux publications |

Le module réutilise également les services communs du projet : `Page` et `InterfaceHtml` pour la présentation, `Database` pour PDO, `Requete` et `ReponseJson` pour les échanges HTTP, `InputFile` et `InputFileImg` pour les fichiers, `FileManager` et `ImageManager` pour le stockage, et `appelAjax` côté navigateur. Cherchez dans ces services avant d’ajouter une fonction équivalente au module.

## Parcours des données

### Consultation

1. Les contrôleurs de l’accueil, de l’archive et de l’espace membre appellent `Information::getLesInformationsVisibles`.
2. La méthode filtre les publications expirées et celles dont la visibilité ne correspond pas au statut du visiteur. La limite est bornée entre 1 et 100.
3. Les documents associés sont chargés en lot pour éviter une requête SQL par publication.
4. `Page::setDonnee` transmet les données à la page ; `getData` les rend accessibles au JavaScript.
5. `public/information/afficher.js` construit les cartes utilisées par plusieurs pages.

Le contrôleur de l’accueil demande cinq informations ; la page d’archive utilise la limite maximale de 100. Les deux utilisent le même service métier et les mêmes règles de visibilité.

### Création et modification

1. Le formulaire de `public/administration/information/` organise la saisie en trois étapes et met à jour l’aperçu.
2. Le navigateur envoie la requête AJAX à l’endpoint d’enregistrement.
3. Le contrôleur exige un POST AJAX avec jeton CSRF, puis contrôle le droit `information`.
4. `Information` nettoie et valide les champs avant l’écriture avec PDO et paramètres liés.
5. L’illustration principale est stockée dans la bibliothèque ; les PDF sont téléversés après l’enregistrement de l’information.

La description est du HTML intentionnel issu de TinyMCE. Les images du texte sont enregistrées par défaut dans `informationcontenu/`. La case **Ajouter les images insérées au texte à la bibliothèque** permet de les stocker dans `photoinformation/`. Ce choix ne change pas le traitement de l’illustration principale.

### Illustrations et droits

La page `public/administration/photoinformation/` est une bibliothèque distincte, protégée par le droit `photoinformation`. Elle réutilise les utilitaires d’images et synchronise la liste des illustrations avec le formulaire ouvert dans un autre onglet. La synchronisation navigateur ne remplace jamais le contrôle d’accès des endpoints.

## Stockage et configuration

| Contenu | Emplacement |
|---|---|
| Illustrations principales réutilisables | `public/data/photoinformation/` |
| Images insérées dans le texte | `public/data/informationcontenu/` |
| PDF des publications | `public/data/documentinformation/` |
| Métadonnées et associations | Tables `information` et `documentinformation` |

Les chemins applicatifs sont définis dans `bootstrap/bootstrap.php`. Les limites sont configurées dans `config/image.php` (300 Ko, formats JPEG/PNG/GIF, largeur de sortie 350 px et limite source de 12 mégapixels) et `config/documentinformation.php` (PDF de 20 Mo maximum).

Le répertoire des PDF n’est pas destiné à être servi directement : les liens passent par `public/information/afficherdocumentinformation.php`, qui vérifie que le document appartient à une information visible. Ne pas remplacer ce contrôle par une URL directe vers le fichier.

## Base de données et mises à jour

Les scripts propres au module se trouvent dans `sql/information/` :

- `create.sql` crée les tables du module ;
- `insert.sql` ajoute les données initiales/exemples ;
- `update.sql` contient une migration ciblée ;
- `permission.sql` enregistre les fonctions `information` et `photoinformation` et accorde ces droits à l’administrateur initial (ID 1) ;
- `event.sql` crée l’événement MySQL quotidien `supprimer_informations_obsoletes`.

Lire les commentaires et vérifier les effets d’un script avant exécution. Le script global [`sql/create database.sql`](../../sql/create%20database.sql) supprime puis recrée **toute la base `ppe`** : il ne s’agit pas d’une mise à jour du seul module Informations et il ne doit pas être exécuté sur une base dont les données sont à conserver.

Pour que l’événement s’exécute, `event_scheduler` doit être activé sur MySQL et le compte qui le crée doit disposer du privilège `EVENT`. L’événement supprime les lignes SQL expirées et leurs associations PDF, mais ne peut pas supprimer les fichiers PDF physiques du serveur.

Avant une migration, sauvegarder la base ainsi que les dossiers d’images et de PDF. Exécuter uniquement le script prévu pour la situation et vérifier les tables, les droits, l’événement et le parcours de publication.

## Contrôles à préserver

- Les endpoints d’écriture doivent imposer une méthode POST AJAX, valider le jeton CSRF et vérifier le droit métier (`information` ou `photoinformation`).
- Les requêtes SQL doivent utiliser PDO et des paramètres liés.
- Le HTML TinyMCE doit passer par `Std::nettoyerHtml` et HTMLPurifier ; les titres et noms de fichiers sont rendus comme du texte.
- Les fichiers doivent être validés côté serveur pour leur erreur d’envoi, taille, extension, MIME et propriétés propres au format. Les contrôles HTML et JavaScript seuls ne suffisent pas.
- Un PDF ne doit être transmis qu’après vérification de la visibilité de l’information à laquelle il est associé.
- Si une écriture SQL échoue après création d’un fichier, traiter explicitement le nettoyage pour éviter les fichiers orphelins.

Les raisons et mécanismes de ces protections sont détaillés dans [Techniques et sécurité](../information/Techniques-et-securite.md).

## Vérification ciblée du module

Après une modification, adapter les vérifications aux fichiers touchés :

1. Lancer `php -l` sur les contrôleurs ou classes PHP modifiés.
2. Lancer `node --check` sur les scripts JavaScript modifiés.
3. Tester la consultation publique, une information privée avec et sans connexion, et une information expirée.
4. Tester la création, la modification et la suppression, avec un compte autorisé puis un compte sans droit.
5. Tester une information contenant plusieurs images et des PDF, ainsi qu’un envoi refusé (format ou taille).
6. Vérifier la réponse JSON et les statuts HTTP dans l’onglet Réseau du navigateur.

### Diagnostic rapide

| Symptôme | Vérifications propres au module |
|---|---|
| Une information manque dans la liste | Visibilité, date d’expiration, connexion et limite demandée par la page |
| Une image du texte n’est pas réutilisable comme illustration | État de la case d’ajout à la bibliothèque au moment du téléversement |
| Une requête AJAX échoue ou ne renvoie pas de JSON | Statut HTTP, jeton CSRF, droit, erreur PHP et format de réponse du contrôleur |
| Un PDF est refusé ou absent | Type réel du fichier, taille, droits d’écriture, association SQL et retour de l’endpoint |
| Un PDF n’est pas accessible à un visiteur | Vérifier si l’information est expirée ou réservée aux membres |

## Notes détaillées du module

- [Architecture et parcours](../information/Architecture.md)
- [Création, affichage et visibilité](../information/Publication-et-affichage.md)
- [Sécurité et validation](../information/Techniques-et-securite.md)
- [Base de données, fichiers et maintenance](../information/Donnees-et-fichiers.md)
