---
tags:
  - documentation
  - accueil
---

# Documentation des informations et actualités PPE

Cette documentation couvre uniquement le module **Informations** : consultation, publication, affichage, fichiers associés et maintenance technique. Les autres rubriques du site PPE ne sont pas couvertes ici.

## Par où commencer ?

- **Je consulte ou publie une information** → [Guide utilisateur](utilisateur/Guide.md)
- **Je développe ou dépanne le module** → [Guide technique](technique/Guide.md)
- **Je cherche un détail technique** → [Notes du module Informations](information/Index.md)

## Arborescence

```text
documentation/
├── Index.md                         Accueil et navigation
├── utilisateur/
│   └── Guide.md                     Consultation et gestion des informations
├── technique/
│   └── Guide.md                     Architecture et maintenance du module Informations
└── information/
    ├── Index.md                     Sommaire technique du module
    ├── Architecture.md              Couches et parcours des annonces
    ├── Publication-et-affichage.md  Création, visibilité et rendu
    ├── Techniques-et-securite.md    Validations et protections
    └── Donnees-et-fichiers.md       Base de données, fichiers et maintenance
```

Les dossiers `.obsidian/` sont des réglages de l’éditeur Obsidian : ils ne font pas partie des guides et ne sont donc pas listés ici.

## Documentation utilisateur

| Document | Utilité |
|---|---|
| [Guide utilisateur](utilisateur/Guide.md) | Consulter, créer, modifier et supprimer des informations ; gérer leurs images et PDF |

## Documentation technique

| Document | Utilité |
|---|---|
| [Guide technique du module](technique/Guide.md) | Fichiers et flux du module, services réutilisés, droits, stockage, SQL, diagnostic et vérifications ciblées |
| [Sommaire du module Informations](information/Index.md) | Accès aux notes techniques détaillées du module |
| [Architecture du module](information/Architecture.md) | Organisation du code et flux de consultation/publication |
| [Publication et affichage](information/Publication-et-affichage.md) | Validation, visibilité, formulaire et rendu |
| [Techniques et sécurité](information/Techniques-et-securite.md) | HTML, SQL, droits, CSRF et téléversements |
| [Données et fichiers](information/Donnees-et-fichiers.md) | Schéma SQL, stockage et expiration |
