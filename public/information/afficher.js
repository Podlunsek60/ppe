"use strict";

export function afficherLesInformations(conteneur, lesInformations, afficherLien = false) {
    if (!conteneur) {
        return;
    }

    conteneur.replaceChildren();
    if (!Array.isArray(lesInformations) || lesInformations.length === 0) {
        const vide = document.createElement("p");
        vide.className = "information-list__empty";
        vide.textContent = "Aucune information à afficher pour le moment.";
        conteneur.appendChild(vide);
        return;
    }

    for (const information of lesInformations) {
        const carte = document.createElement("article");
        carte.className = "information-card";

        const entete = document.createElement("div");
        entete.className = "information-card__heading";

        const logo = document.createElement("span");
        logo.className = "information-card__logo";
        if (information.illustration) {
            const image = document.createElement("img");
            image.className = "information-card__logo-image";
            image.src = `/data/photoinformation/${encodeURIComponent(information.illustration)}`;
            image.alt = "";
            image.loading = "lazy";
            image.addEventListener("error", () => {
                logo.textContent = "📰";
                logo.classList.add("information-card__logo--fallback");
            }, {once: true});
            logo.appendChild(image);
        } else {
            logo.textContent = "📰";
            logo.classList.add("information-card__logo--fallback");
        }
        entete.appendChild(logo);

        const titre = document.createElement("h2");
        titre.className = "information-card__title";
        titre.textContent = information.titre;
        entete.appendChild(titre);

        const meta = document.createElement("span");
        meta.className = "information-card__meta";
        const date = new Date(String(information.datePublication).replace(" ", "T"));
        meta.textContent = Number.isNaN(date.getTime())
            ? ""
            : date.toLocaleDateString("fr-FR", {day: "numeric", month: "long", year: "numeric"});
        entete.appendChild(meta);

        const type = document.createElement("span");
        type.className = information.type === "privée"
            ? "information-card__type information-card__type--private"
            : "information-card__type";
        type.textContent = information.type === "privée" ? "Privé · membres" : "Public";
        entete.appendChild(type);
        carte.appendChild(entete);

        const contenu = document.createElement("div");
        contenu.className = "information-card__content";
        contenu.innerHTML = information.description;
        carte.appendChild(contenu);

        if (Array.isArray(information.documents) && information.documents.length > 0) {
            const documents = document.createElement("div");
            documents.className = "information-card__documents";
            for (const documentInformation of information.documents) {
                const lien = document.createElement("a");
                lien.className = "information-card__document";
                lien.href = "/information/afficherdocumentinformation.php?id="
                    + encodeURIComponent(documentInformation.idDocument);
                lien.target = "_blank";
                lien.rel = "noopener";
                lien.textContent = "📄 " + documentInformation.nomDocument;
                documents.appendChild(lien);
            }
            carte.appendChild(documents);
        }

        conteneur.appendChild(carte);
    }

    if (afficherLien) {
        const lien = document.createElement("a");
        lien.href = "/information/";
        lien.textContent = "Voir toutes les informations";
        conteneur.appendChild(lien);
    }
}
