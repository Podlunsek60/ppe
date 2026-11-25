---
tags:
  - module/informations
  - base-de-donnees
  - stockage
---

# Données, fichiers et maintenance

## Modèle relationnel

Le schéma est défini dans [`sql/information/create.sql`](../../sql/information/create.sql).

### `information`

| Colonne | Utilité |
|---|---|
| `idInformation` | Clé primaire, identifiant stable |
| `titre` | Titre de 150 caractères maximum |
| `description` | Contenu HTML nettoyé |
| `illustration` | Nom de l’illustration facultative |
| `type` | `publique` ou `privée` |
| `datePublication` | Date de création, remplie par défaut par MySQL |
| `dateExpiration` | Dernier jour où la publication reste visible |

### `documentinformation`

| Colonne | Utilité |
|---|---|
| `idDocument` | Identifiant du PDF |
| `idInformation` | Clé étrangère vers la publication |
| `nomDocument` | Nom d’origine à afficher |
| `nomStocke` | Nom physique généré par le serveur |
| `consultations` | Compteur de téléchargements/consultations |

La clé étrangère avec `ON DELETE CASCADE` garantit que supprimer une information supprime aussi ses lignes document en SQL. Les fichiers physiques doivent néanmoins être effacés par le code : MySQL ne peut pas supprimer des fichiers du disque.

## Index et contraintes

- Les clés primaires identifient chaque ligne.
- L’unicité de `nomStocke` empêche deux documents de partager le même nom physique.
- L’index sur `documentinformation.idInformation` accélère la récupération des PDF d’une publication.
- Les index de dates accélèrent les filtres par expiration et l’ordre de publication.
- Les contraintes `CHECK` vérifient en base que les titres et descriptions ne sont pas vides (si la version MySQL les applique).

Les validations PHP complètent ces contraintes : elles produisent des messages utilisateur et vérifient les formats de données qui ne sont pas exprimables simplement dans le schéma.

## Requêtes en lots

`ajouterLesDocuments` charge les documents de toutes les informations d’une liste en une seule requête `IN (...)`, puis les regroupe en PHP par `idInformation`.

**Pourquoi :** au lieu d’exécuter une requête SQL par publication (problème dit « N+1 »), le modèle exécute une requête de documents pour toute la page. Les paramètres `?` sont créés en fonction du nombre d’identifiants ; les valeurs elles-mêmes restent liées à la requête.

## Emplacement et configuration

Les chemins absolus sont définis dans [`bootstrap/bootstrap.php`](../../bootstrap/bootstrap.php) :

- illustrations : `DOSSIER_PHOTO_INFORMATION`, sous `public/data/photoinformation/` ;
- PDF : `DOSSIER_DOCUMENT_INFORMATION`, sous `public/data/documentinformation/`.

Les réglages des PDF sont dans [`config/documentinformation.php`](../../config/documentinformation.php) : 20 Mo maximum, extension PDF et types MIME PDF. Les réglages d’illustration sont dans [`config/image.php`](../../config/image.php) : 300 Ko, formats JPEG/PNG/GIF, largeur de 350 px et limite source de 12 mégapixels.

## Expiration

Les méthodes de consultation appellent `supprimerLesObsoletes`. La méthode récupère les noms des PDF expirés, supprime les lignes information (les lignes enfants sont effacées en cascade), puis supprime les fichiers physiques connus.

L’expiration est donc appliquée à la première consultation qui déclenche cette méthode, pas par un planificateur à heure fixe. `dateExpiration >= CURDATE()` maintient également le filtrage de visibilité dans les lectures.

## Compteur de consultation

Lorsqu’un document est autorisé, `obtenirDocumentVisible` incrémente `consultations` juste avant que le contrôleur lise le fichier. Le compteur représente les accès autorisés au contrôleur, et non nécessairement les PDF effectivement lus intégralement par le navigateur.

## Scripts SQL

- [`create.sql`](../../sql/information/create.sql) : crée les tables et accorde les privilèges SQL nécessaires au compte applicatif.
- [`insert.sql`](../../sql/information/insert.sql) : données initiales/exemples du module.
- [`update.sql`](../../sql/information/update.sql) : migration de schéma ciblée pour une base déjà créée.
- [`permission.sql`](../../sql/information/permission.sql) : enregistre la fonction `information` et accorde les droits `information` et `photoinformation` à l’administrateur initial (ID 1).

Lire les commentaires du script avant exécution : un script d’installation initiale et une migration sur base existante n’ont pas le même usage.
