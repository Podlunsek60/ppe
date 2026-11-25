"use strict";

export function afficherLesInformations(conteneur, lesInformations, afficherLien = false, compact = false) {
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

    if (conteneur.classList.contains("information-list--archive")) {
        const resume = document.createElement("div");
        resume.className = "information-list__header";

        const titreListe = document.createElement("h2");
        titreListe.className = "information-list__title";
        titreListe.textContent = "À la une";

        const nombre = document.createElement("span");
        nombre.className = "information-list__count";
        nombre.textContent = `${lesInformations.length} publication${lesInformations.length > 1 ? "s" : ""}`;

        resume.append(titreListe, nombre);
        conteneur.appendChild(resume);
    }

    for (const information of lesInformations) {
        const carte = document.createElement("article");
        carte.className = "information-card";
        if (compact) {
            carte.classList.add("information-card--compact");
        }
        const urlDetail = `/information/detail.php?id=${encodeURIComponent(information.idInformation)}`;
        carte.setAttribute("role", "link");
        carte.setAttribute("tabindex", "0");
        carte.setAttribute("aria-label", `Lire l’information : ${information.titre}`);
        carte.addEventListener("click", event => {
            if (event.target.closest("a")) {
                return;
            }
            window.location.href = urlDetail;
        });
        carte.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                window.location.href = urlDetail;
            }
        });

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

        const enteteTexte = document.createElement("div");
        enteteTexte.className = "information-card__heading-text";

        const titre = document.createElement("h2");
        titre.className = "information-card__title";
        const lienTitre = document.createElement("a");
        lienTitre.href = urlDetail;
        lienTitre.textContent = information.titre;
        titre.appendChild(lienTitre);
        enteteTexte.appendChild(titre);

        const meta = document.createElement("time");
        meta.className = "information-card__meta";
        const date = new Date(String(information.datePublication).replace(" ", "T"));
        if (!Number.isNaN(date.getTime())) {
            meta.dateTime = String(information.datePublication).replace(" ", "T");
            meta.textContent = date.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
            enteteTexte.appendChild(meta);
        }
        entete.appendChild(enteteTexte);

        const type = document.createElement("span");
        type.className = information.type === "privée"
            ? "information-card__type information-card__type--private"
            : "information-card__type";
        type.textContent = information.type === "privée" ? "Privé · membres" : "Public";
        entete.appendChild(type);
        carte.appendChild(entete);

        if (!compact) {
            const contenu = document.createElement("div");
            contenu.className = "information-card__content";
            contenu.innerHTML = information.description;
            carte.appendChild(contenu);
        }

        if (!compact && Array.isArray(information.documents) && information.documents.length > 0) {
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

        const pied = document.createElement("div");
        pied.className = "information-card__read";
        const lienLire = document.createElement("a");
        lienLire.href = urlDetail;
        lienLire.className = "information-card__read-link";
        lienLire.textContent = "Lire l’information";
        pied.appendChild(lienLire);
        carte.appendChild(pied);

        conteneur.appendChild(carte);
    }

    if (afficherLien) {
        const lien = document.createElement("a");
        lien.href = "/information/";
        lien.textContent = "Voir toutes les informations";
        conteneur.appendChild(lien);
    }
}
