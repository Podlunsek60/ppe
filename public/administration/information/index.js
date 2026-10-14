"use strict";

import {appelAjax} from "/composant/fonction/ajax.js";
import {getData} from "/composant/fonction/page.js";

const lesInformations = getData("lesInformations") ?? [];
const lesPhotos = getData("lesPhotos") ?? [];
const lesIllustrations = getData("lesIllustrations") ?? [];
const lignes = document.getElementById("lesLignesInformation");
const formulaire = document.getElementById("formInformation");
const idInformation = document.getElementById("idInformation");
const titre = document.getElementById("titre");
const type = document.getElementById("type");
const dateExpiration = document.getElementById("dateExpiration");
const description = document.getElementById("description");
const illustration = document.getElementById("illustration");
const illustrationApercu = document.getElementById("illustrationApercu");
const titreFormulaire = document.getElementById("titreFormulaire");

for (const image of lesIllustrations) {
    const option = document.createElement("option");
    option.value = image.nom;
    option.textContent = image.nom;
    illustration.appendChild(option);
}

function afficherApercuIllustration() {
    const selection = lesIllustrations.find(image => image.nom === illustration.value);
    illustrationApercu.hidden = !selection;
    if (selection) {
        illustrationApercu.src = selection.url;
    } else {
        illustrationApercu.removeAttribute("src");
    }
}

function dateParDefaut() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function setDescription(contenu) {
    description.value = contenu;
    const editeur = window.tinymce?.get("description");
    if (editeur) {
        editeur.setContent(contenu);
    }
}

function nouvelleInformation() {
    formulaire.reset();
    idInformation.value = "0";
    dateExpiration.value = dateParDefaut();
    type.value = "publique";
    illustration.value = "";
    afficherApercuIllustration();
    setDescription("");
    titreFormulaire.textContent = "Ajouter une information";
}

function modifierInformation(information) {
    idInformation.value = information.idInformation;
    titre.value = information.titre;
    type.value = information.type;
    dateExpiration.value = information.dateExpiration;
    illustration.value = information.illustration ?? "";
    afficherApercuIllustration();
    setDescription(information.description);
    titreFormulaire.textContent = "Modifier une information";
    formulaire.scrollIntoView({behavior: "smooth", block: "start"});
}

function ajouterAction(conteneur, libelle, action, classe) {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = classe;
    bouton.textContent = libelle;
    bouton.addEventListener("click", action);
    conteneur.appendChild(bouton);
}

function afficherListe() {
    lignes.replaceChildren();
    if (lesInformations.length === 0) {
        const tr = lignes.insertRow();
        const td = tr.insertCell();
        td.colSpan = 5;
        td.textContent = "Aucune information publiée.";
        return;
    }

    for (const information of lesInformations) {
        const tr = lignes.insertRow();
        tr.insertCell().textContent = information.titre;
        tr.insertCell().textContent = information.type === "privée" ? "Privée" : "Publique";
        tr.insertCell().textContent = information.dateExpiration;
        tr.insertCell().textContent = information.documents.length;

        const actions = tr.insertCell();
        actions.className = "information-admin-actions";
        ajouterAction(actions, "Modifier", () => modifierInformation(information), "btn btn-sm btn-outline-primary");

        const lienDocuments = document.createElement("a");
        lienDocuments.className = "btn btn-sm btn-outline-secondary";
        lienDocuments.href = `documents.php?id=${encodeURIComponent(information.idInformation)}`;
        lienDocuments.textContent = `Gérer les PDF (${information.documents.length})`;
        actions.appendChild(lienDocuments);

        ajouterAction(actions, "Supprimer", () => {
            if (!window.confirm(`Supprimer « ${information.titre} » et ses documents ?`)) {
                return;
            }
            appelAjax({
                url: "ajax/supprimer.php",
                data: {idInformation: information.idInformation},
                success: () => window.location.reload()
            });
        }, "btn btn-sm btn-outline-danger");
    }
}

document.getElementById("btnNouvelleInformation").addEventListener("click", () => {
    nouvelleInformation();
    formulaire.scrollIntoView({behavior: "smooth", block: "start"});
});
document.getElementById("btnAnnulerModification").addEventListener("click", nouvelleInformation);
illustration.addEventListener("change", afficherApercuIllustration);

formulaire.addEventListener("submit", event => {
    event.preventDefault();
    if (!formulaire.reportValidity()) {
        return;
    }

    const editeur = window.tinymce?.get("description");
    appelAjax({
        url: "ajax/enregistrer.php",
        data: {
            columns: {
                idInformation: idInformation.value,
                titre: titre.value,
                illustration: illustration.value,
                type: type.value,
                dateExpiration: dateExpiration.value,
                description: editeur ? editeur.getContent() : description.value
            }
        },
        success: data => {
            window.location.href = `documents.php?id=${encodeURIComponent(data.idInformation)}`;
        }
    });
});

window.tinymce.init({
    license_key: "gpl",
    selector: "#description",
    menubar: false,
    plugins: "link image lists table autoresize code",
    toolbar: "undo redo | bold italic underline | link image | bullist numlist | table | code",
    image_title: true,
    automatic_uploads: false,
    image_list: lesPhotos
}).then(() => {
    window.tinymce.get("description").setContent(description.value);
});

dateExpiration.value = dateParDefaut();
afficherListe();
