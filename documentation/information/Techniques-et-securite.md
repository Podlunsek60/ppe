---
tags:
  - module/informations
  - securite
  - techniques
---

# Techniques de code et sécurité

Cette note explique pourquoi les mécanismes du module existent et ce qu’ils protègent. Les contrôles côté navigateur améliorent l’expérience, mais les validations importantes sont toujours répétées côté serveur.

## Paramètres SQL et PDO

Les valeurs sont transmises à `PDOStatement::execute` ou `bindValue`, au lieu d’être assemblées dans une chaîne SQL.

**Pourquoi :** PDO sépare la structure de la requête de ses données ; une valeur utilisateur ne peut donc pas devenir un fragment de SQL. Les paramètres `PDO::PARAM_INT` et `PDO::PARAM_BOOL` précisent le type des limites et du statut de connexion.

Les requêtes dont la structure varie selon les données ne doivent jamais interpoler une valeur non fiable. Dans `ajouterLesDocuments`, les marqueurs `?` sont générés à partir du nombre d’identifiants obtenus de la base, puis les identifiants sont liés.

## Défense en profondeur pour HTML

Le contenu TinyMCE est du HTML intentionnel, donc l’échappement simple de tous les caractères casserait la mise en forme. `HTMLPurifier` applique une liste de balises et attributs permis : il supprime les scripts et attributs dangereux tout en conservant le formatage pris en charge.

À l’inverse, titre, date, visibilité et noms de PDF sont du texte. Le rendu navigateur les ajoute par `textContent`, qui les traite comme du texte et non comme du balisage HTML.

**À retenir :** ne pas remplacer `textContent` par `innerHTML` pour les champs texte. Ne jamais afficher une description qui n’a pas traversé le nettoyage HTML.

## Contrôle d’accès et CSRF

Les contrôleurs AJAX commencent par `Requete::exigerPost()`. Cet appel impose une requête AJAX en POST et vérifie le jeton CSRF. Les contrôleurs appellent ensuite `Information::verifierDroitAdministration()` avant toute mutation.

**Pourquoi les deux contrôles :**

- Le jeton CSRF empêche un site tiers de faire exécuter à l’administrateur connecté une action qu’il n’a pas demandée.
- Le droit `information` empêche un membre ou un administrateur sans cette permission de modifier les publications.
- Les vérifications serveur restent obligatoires même si l’interface masque les boutons.

Le contrôle des droits générique reconnaît les URL d’administration AJAX comme des sous-répertoires techniques. Le contrôleur d’action doit donc effectuer explicitement le contrôle métier ; c’est le cas des points d’entrée de création, suppression, PDF et illustration.

La bibliothèque des illustrations utilise le droit distinct `photoinformation`. Ses endpoints d’ajout et de suppression le vérifient explicitement. Dans le formulaire, les changements effectués dans l’onglet de bibliothèque sont synchronisés avec `BroadcastChannel` ; les deux pages appartiennent à la même origine. Le message est en plus filtré sur son type attendu et sur la forme de sa liste de noms de fichiers avant de modifier le menu déroulant. Cette synchronisation met à jour l’interface, mais ne confère aucun droit côté serveur : les endpoints restent la frontière de sécurité.

## Validation des fichiers

`InputFile::checkValidity()` compose plusieurs vérifications :

1. code d’erreur PHP et origine du fichier (`is_uploaded_file`) ;
2. taille maximale ;
3. extension ;
4. type MIME déterminé côté serveur par `finfo` ;
5. contrôles propres au format ;
6. normalisation du nom d’origine.

**Pourquoi vérifier plusieurs propriétés :** le nom et l’extension fournis par le navigateur ne prouvent pas le contenu du fichier. La limite de taille borne l’espace disque et la bande passante ; le MIME et les contrôles de format rejettent les fichiers qui ne correspondent pas au format attendu.

### Images

`InputFileImg` vérifie les dimensions source avec `getimagesize`. La limite configurée de 12 mégapixels est testée avant le redimensionnement. La taille compressée du fichier ne borne pas la mémoire nécessaire au décodage d’une image très grande ; cette limite protège donc le serveur contre une consommation mémoire excessive.

`ImageManager` effectue le redimensionnement à 350 pixels de large et stocke l’image transformée. L’image n’est utilisable comme illustration principale qu’après vérification de son nom et de sa présence dans le répertoire prévu.

### PDF

Le nom physique stocké est aléatoire (`random_bytes`) et finit par `.pdf`; le nom d’origine est conservé séparément pour l’affichage. La signature `%PDF-` complète les contrôles MIME et extension. Ce contrôle confirme le format déclaré, sans prétendre analyser le PDF contre tous les contenus actifs possibles.

## Accès contrôlé aux PDF

Le répertoire `public/data/documentinformation/` interdit la lecture HTTP directe avec `.htaccess`. L’URL publique ne révèle que l’identifiant numérique du document ; le contrôleur résout son nom physique depuis SQL.

`obtenirDocumentVisible` joint le document à son information et applique expiration et visibilité dans la même requête. Le contrôleur n’envoie le fichier qu’après ce contrôle, avec `Content-Type`, `nosniff`, `Cache-Control: private, no-store` et une politique de sécurité pour le PDF.

`basename` limite en plus le chemin lu au nom de fichier, même si une valeur de base de données était inattendue. `is_file`, `is_readable` et `filesize` sont vérifiés avant l’envoi.

## Noms de fichiers et chemins

Les fichiers stockés sont utilisés sous un nom généré par le serveur ; les noms originaux ne servent pas à construire le chemin du PDF. `FileManager` vérifie les noms et refuse les séparateurs ou tentatives de sortie du répertoire.

Pour construire l’URL d’une illustration, le nom est encodé avec `rawurlencode`/`encodeURIComponent`. L’encodage d’URL rend le nom sûr pour le transport ; il ne remplace pas la validation métier du fichier.

## Échec et compensation

SQL et disque ne constituent pas une transaction distribuée. Lors d’un ajout PDF, le contrôleur écrit le fichier, insère les métadonnées, puis tente un nettoyage explicite si l’insertion échoue. La suppression d’une information récupère d’abord les noms des PDF pour pouvoir les enlever après la suppression SQL.

Ce type de flux doit toujours traiter explicitement l’échec du nettoyage : sinon, un fichier orphelin pourrait rester sur disque ou un enregistrement pourrait pointer vers un fichier manquant.
