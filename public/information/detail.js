"use strict";

import {getData} from "/composant/fonction/page.js";

const information = getData("information");
const conteneur = document.getElementById("detailInformation");

if (!information) {
    conteneur.textContent = "Information introuvable.";
} else {
    const entete = document.createElement("header");
    entete.className = "information-detail__header";

    const logo = document.createElement("span");
    logo.className = "information-detail__logo";
    if (information.illustration) {
        const image = document.createElement("img");
        image.src = `/data/photoinformation/${encodeURIComponent(information.illustration)}`;
        image.alt = "";
        logo.appendChild(image);
    } else {
        logo.textContent = "📰";
    }
    entete.appendChild(logo);

    const enteteTexte = document.createElement("div");
    enteteTexte.className = "information-detail__heading";

    const titre = document.createElement("h1");
    titre.textContent = information.titre;
    enteteTexte.appendChild(titre);

    const meta = document.createElement("time");
    meta.className = "information-detail__meta";
    const date = new Date(String(information.datePublication).replace(" ", "T"));
    if (!Number.isNaN(date.getTime())) {
        meta.dateTime = String(information.datePublication).replace(" ", "T");
        meta.textContent = date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }
    enteteTexte.appendChild(meta);
    entete.appendChild(enteteTexte);
    conteneur.appendChild(entete);

    const contenu = document.createElement("div");
    contenu.className = "information-card__content information-detail__content";
    contenu.innerHTML = information.description;
    conteneur.appendChild(contenu);

    if (Array.isArray(information.documents) && information.documents.length > 0) {
        const documents = document.createElement("section");
        documents.className = "information-detail__documents";

        const titreDocuments = document.createElement("h2");
        titreDocuments.textContent = "Documents joints";
        documents.appendChild(titreDocuments);

        for (const documentInformation of information.documents) {
            const lien = document.createElement("a");
            lien.href = `/information/afficherdocumentinformation.php?id=${encodeURIComponent(documentInformation.idDocument)}`;
            lien.target = "_blank";
            lien.rel = "noopener";
            lien.className = "information-card__document";
            lien.textContent = `📄 ${documentInformation.nomDocument}`;
            documents.appendChild(lien);
        }
        conteneur.appendChild(documents);
    }
}
