"use strict";

import {appelAjax} from "/composant/fonction/ajax.js";
import {getData} from "/composant/fonction/page.js";

const information = getData("information");
const tbody = document.getElementById("lesDocuments");
const fichiers = document.getElementById("fichiers");
const documents = information.documents ?? [];

document.getElementById("titreInformation").textContent = `Information : ${information.titre}`;

function afficherDocuments() {
    tbody.replaceChildren();
    if (documents.length === 0) {
        const ligne = tbody.insertRow();
        const cellule = ligne.insertCell();
        cellule.colSpan = 3;
        cellule.textContent = "Aucun document associé à cette information.";
        return;
    }

    for (const documentInformation of documents) {
        const ligne = tbody.insertRow();
        const action = ligne.insertCell();
        const supprimer = document.createElement("button");
        supprimer.type = "button";
        supprimer.className = "btn btn-link document-supprimer";
        supprimer.textContent = "×";
        supprimer.setAttribute("aria-label", `Supprimer ${documentInformation.nomDocument}`);
        supprimer.addEventListener("click", () => {
            if (!window.confirm(`Supprimer le document « ${documentInformation.nomDocument} » ?`)) {
                return;
            }
            appelAjax({
                url: "documents/ajax/supprimer.php",
                data: {
                    idInformation: information.idInformation,
                    idDocument: documentInformation.idDocument
                },
                success: () => window.location.reload()
            });
        });
        action.appendChild(supprimer);
        ligne.insertCell().textContent = documentInformation.nomDocument;
        ligne.insertCell().textContent = documentInformation.consultations;
    }
}

document.getElementById("formDocuments").addEventListener("submit", async event => {
    event.preventDefault();
    if (fichiers.files.length === 0) {
        return;
    }

    for (const fichier of fichiers.files) {
        const donnees = new FormData();
        donnees.append("idInformation", information.idInformation);
        donnees.append("fichier", fichier);
        const reponse = await appelAjax({
            url: "documents/ajax/ajouter.php",
            data: donnees
        });
        if (!reponse) {
            return;
        }
    }
    window.location.reload();
});

afficherDocuments();
