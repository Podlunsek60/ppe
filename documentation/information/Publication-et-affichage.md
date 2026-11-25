---
tags:
  - module/informations
  - publication
  - frontend
---

# Publication et affichage

## Créer ou modifier une actualité

L’écran d’administration est dans [`public/administration/information/`](../../public/administration/information/). Le formulaire envoie par AJAX les champs `titre`, `description`, `illustration`, `type`, `dateExpiration` et `idInformation` au contrôleur `ajax/enregistrer.php`.

Dans [`Information::enregistrer`](../../src/ClasseMetier/Information.php), les contrôles métier sont appliqués avant la requête SQL :

1. Le titre est normalisé puis limité à 150 caractères.
2. Le contenu HTML est nettoyé par `Std::nettoyerHtml`.
3. Une description avec texte ou image est exigée.
4. Le type est limité à `publique` ou `privée`.
5. Si une illustration est indiquée, son nom, son extension et sa présence sur disque sont contrôlés.
6. La date d’expiration doit être une date valide, aujourd’hui ou ultérieure.
7. L’identifiant `0` signifie création ; un identifiant positif signifie modification.

Les requêtes sont préparées avec PDO. Le titre et la description sont envoyés en paramètres SQL, et non concaténés dans la requête.

### Parcours du formulaire

Le formulaire d’administration organise la rédaction en trois étapes :

1. **Essentiel** : titre, visibilité et date de fin de publication.
2. **Sujet** : rédiger le contenu avec TinyMCE et insérer, si besoin, des images.
3. **Facultatif** : vérifier l’aperçu en direct, choisir l’illustration principale et sélectionner les PDF.

L’illustration principale et les PDF sont facultatifs. Le serveur exige toutefois un titre et une description contenant du texte ou une image. La visibilité et la date d’expiration sont préremplies, mais restent modifiables.

## Publication publique ou privée

`getLesInformationsVisibles(bool $membreConnecte, int $limite)` applique les mêmes règles pour les cartes et leurs documents :

- Une information expirée n’est jamais renvoyée.
- Un visiteur non connecté ne voit que `publique`.
- Un membre connecté voit les deux types.
- La limite est bornée entre 1 et 100.

La requête utilise un paramètre lié pour l’état membre et un entier lié pour `LIMIT`. Les filtres ne sont pas interpolés comme texte SQL.

## Description riche et HTML

La description peut contenir des paragraphes, listes, liens, images et tableaux issus de TinyMCE. HTML Purifier, appelé par `Std::nettoyerHtml`, retire ou corrige les balises et attributs HTML non autorisés.

Le nettoyage est effectué avant l’écriture et lors de la préparation des données à afficher. Le JavaScript insère ensuite le HTML déjà purifié dans la zone de contenu, tandis que les champs textuels comme le titre et le nom du document sont insérés avec `textContent`. Cette distinction préserve le formatage autorisé sans traiter les titres comme du HTML.

## Illustrations

Une information peut n’avoir aucune illustration : l’affichage utilise alors son pictogramme de remplacement. L’illustration principale est un nom de fichier existant dans `public/data/photoinformation/`. Dans le formulaire, elle dispose d’une section **Image ou logo** distincte de la section réservée aux PDF.

La page d’administration [`/administration/photoinformation/`](../../public/administration/photoinformation/index.php) est la bibliothèque réutilisable des illustrations principales. Les images téléversées depuis cette page apparaissent dans le choix d’illustration lors de la création d’une actualité. La liste du répertoire est chargée côté PHP et transmise au navigateur pour construire ce menu.

Depuis le formulaire, les liens « Gérer les images par défaut » et « Ajouter des images réutilisables à la bibliothèque » ouvrent cette page dans un nouvel onglet afin de préserver le brouillon. Après chaque ajout ou suppression, la bibliothèque transmet la liste mise à jour par `BroadcastChannel` ; le menu déroulant et son aperçu sont alors actualisés sans recharger le formulaire.

Sur la page bibliothèque, l’administrateur peut ajouter des images par glisser-déposer ou en parcourant les fichiers, puis supprimer celles qui ne sont pas utilisées. La suppression d’une image référencée par une information est refusée par le serveur. Cette page exige le droit `photoinformation`, séparé du droit `information` utilisé pour gérer les actualités. Le script [`permission.sql`](../../sql/information/permission.sql) accorde ces deux droits à l’administrateur initial (ID 1) ; relancez-le pour attribuer le nouveau droit de bibliothèque si le script avait déjà été exécuté.

La bibliothèque réutilise les utilitaires communs de l’application : `fichierValide` et `verifierImage` côté navigateur, `InputFileImg` et `ImageManager` côté serveur, ainsi que `FileManager` pour lister et supprimer les fichiers. Le droit `photoinformation` est contrôlé à la fois sur les endpoints d’ajout et de suppression ; une image encore associée à une actualité ne peut pas être supprimée.

Le formulaire affiche un aperçu, y compris un emplacement visuel quand aucune image n’est choisie. Son bouton d’ajout direct téléverse l’illustration principale vers `ajax/ajouterillustration.php` avec `FormData`. Le serveur valide et redimensionne l’image avec les mêmes outils que la bibliothèque, puis le navigateur ajoute l’option au menu et affiche l’aperçu. Cette illustration est placée dans `photoinformation/`; son nom est enregistré avec l’information.

La barre d’outils TinyMCE téléverse les images insérées dans la description via le même endpoint. Par défaut, elles sont stockées dans `informationcontenu/`, séparément de la bibliothèque. La case « Ajouter les images insérées au texte à la bibliothèque », décochée par défaut, permet de les enregistrer dans `photoinformation/`. Ces images ne remplacent pas l’illustration principale.

## Documents PDF

Les PDF sont sélectionnés dans une section dédiée du même formulaire. La sélection multiple est permise et l’interface affiche le nom et la taille de chaque fichier ; chaque fichier peut être retiré de la sélection avant l’enregistrement. La suppression d’un fichier de la sélection et son retrait après envoi réussi utilisent la même fonction de reconstruction de la liste de fichiers. Les PDF sont téléversés après l’enregistrement de l’information, car chaque document doit être associé à son identifiant. Le navigateur envoie les fichiers un par un à `documents/ajax/ajouter.php`. Après chaque envoi réussi, le fichier correspondant est retiré de la sélection. Si un envoi échoue, les PDF déjà téléversés ne sont donc pas renvoyés lors d’une nouvelle tentative ; les autres restent disponibles. L’écran de gestion des documents reste accessible depuis la liste pour les ajouts ultérieurs.

Pour chaque téléversement, le serveur :

1. exige un POST AJAX avec jeton CSRF et le droit `information` ;
2. vérifie erreur de téléversement, taille, extension et type MIME ;
3. contrôle la présence de la signature `%PDF-` au début du contenu ;
4. génère un nom stocké aléatoire et copie le fichier dans le répertoire privé ;
5. enregistre le nom d’origine et le rattachement SQL.

Si l’écriture SQL échoue après la copie, le contrôleur tente de supprimer le fichier nouvellement copié, puis relance l’erreur. Cette compensation est nécessaire parce que le système de fichiers et MySQL ne partagent pas une transaction.

## Rendu des cartes

[`public/information/afficher.js`](../../public/information/afficher.js) construit le DOM avec `createElement`, `append` et `textContent`. La date est affichée dans un élément sémantique `<time>`, le badge reflète le type de publication et les documents sont présentés comme des liens vers le contrôleur de téléchargement.

`afficherLesInformations` est partagé par plusieurs pages. La variante archive est activée par la classe `information-list--archive`; elle ajoute le titre « À la une » et le nombre de publications. Les règles CSS propres à l’archive ne changent pas le rendu compact utilisé sur l’accueil.
