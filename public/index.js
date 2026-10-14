"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {getData} from "/composant/fonction/page.js";
import {initialiserToutesLesCartes} from "/composant/fonction/openclose.js";
import {afficherLesInformations} from "/information/afficher.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

// récupération des données transmises à l'interface
const laProchaineEpreuve = getData("laProchaineEpreuve");
const lesInformations = getData("lesInformations");


// Récupération des éléments de l'interface

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

if (laProchaineEpreuve?.date) {
    const dateObj = new Date(laProchaineEpreuve.date);
    const dateFormatee = dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    document.getElementById("dateEpreuve").innerText = dateFormatee;
}



initialiserToutesLesCartes();
afficherLesInformations(document.getElementById("informations-recentes"), lesInformations, false);






