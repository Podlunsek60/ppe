"use strict";

import {appelAjax} from "/composant/fonction/ajax.js";
import {getData} from "/composant/fonction/page.js";

const lesInformations = getData("lesInformations") ?? [];
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
const illustrationApercuVide = document.getElementById("illustrationApercuVide");
const illustrationFichier = document.getElementById("illustrationFichier");
const btnTeleverserIllustration = document.getElementById("btnTeleverserIllustration");
const fichiersPdf = document.getElementById("fichiersPdf");
const listeFichiersPdf = document.getElementById("listeFichiersPdf");
const btnEnregistrerInformation = document.getElementById("btnEnregistrerInformation");
const titreFormulaire = document.getElementById("titreFormulaire");
const panneauEditeur = document.querySelector(".information-admin-panel--editor");
const badgeModeInformation = document.getElementById("badgeModeInformation");
const leadFormulaire = document.getElementById("leadFormulaire");
const apercuInformation = document.getElementById("apercuInformation");
const lesEtapes = Array.from(document.querySelectorAll(".information-form__step-content"));
const lesIndicateursEtapes = Array.from(document.querySelectorAll(".information-form__step-item"));
const btnEtapePrecedente = document.getElementById("btnEtapePrecedente");
const btnEtapeSuivante = document.getElementById("btnEtapeSuivante");
const numeroEtape = document.getElementById("numeroEtape");
let etapeCourante = 1;

function afficherEtape(etape) {
    etapeCourante = Math.max(1, Math.min(3, etape));

    for (const contenu of lesEtapes) {
        contenu.hidden = Number(contenu.dataset.etape) !== etapeCourante;
    }
    for (const indicateur of lesIndicateursEtapes) {
        const numero = Number(indicateur.dataset.etape);
        indicateur.classList.toggle("information-form__step-item--active", numero === etapeCourante);
        indicateur.classList.toggle("information-form__step-item--complete", numero < etapeCourante);
    }

    numeroEtape.textContent = String(etapeCourante);
    btnEtapePrecedente.hidden = etapeCourante === 1;
    btnEtapeSuivante.hidden = etapeCourante === 3;
    btnEnregistrerInformation.hidden = etapeCourante !== 3;
    if (etapeCourante === 3) {
        actualiserApercuInformation();
    }

    if (etapeCourante === 2 && !window.tinymce?.get("description")) {
        initialiserEditeurDescription();
    }
}

function validerEtapeCourante() {
    if (etapeCourante === 1) {
        return titre.reportValidity() && type.reportValidity() && dateExpiration.reportValidity();
    }
    if (etapeCourante === 2) {
        const editeur = window.tinymce?.get("description");
        const contenu = editeur ? editeur.getContent() : description.value;
        const texte = extraireTexte(contenu);
        if (texte === "" && !/<img\b/i.test(contenu)) {
            const message = document.createElement("div");
            message.className = "alert alert-danger";
            message.textContent = "Le sujet et le contenu sont obligatoires.";
            document.getElementById("msg").replaceChildren(message);
            return false;
        }
        document.getElementById("msg").replaceChildren();
        return true;
    }
    return true;
}

function extraireTexte(html) {
    const zone = document.createElement("div");
    zone.innerHTML = html;
    return (zone.textContent || "").replace(/\s+/g, " ").trim();
}

function actualiserApercuInformation() {
    if (!apercuInformation) {
        return;
    }

    const editeur = window.tinymce?.get("description");
    const contenu = editeur ? editeur.getContent() : description.value;
    const selection = lesIllustrations.find(image => image.nom === illustration.value);

    apercuInformation.replaceChildren();

    const entete = document.createElement("div");
    entete.className = "information-form__preview-header";

    const logo = document.createElement("div");
    logo.className = "information-form__preview-logo";
    if (selection) {
        const image = document.createElement("img");
        image.src = selection.url;
        image.alt = "";
        logo.appendChild(image);
    } else {
        logo.textContent = "📰";
        logo.className += " d-flex align-items-center justify-content-center";
    }
    entete.appendChild(logo);

    const enteteTexte = document.createElement("div");
    enteteTexte.className = "information-form__preview-heading-text";
    const titreApercu = document.createElement("h3");
    titreApercu.textContent = titre.value.trim() || "Titre de l’information";
    enteteTexte.appendChild(titreApercu);

    const meta = document.createElement("div");
    meta.className = "information-form__preview-meta";
    meta.textContent = type.value === "privée"
        ? "Privée · membres connectés"
        : "Publique · visible par tous";
    enteteTexte.appendChild(meta);
    entete.appendChild(enteteTexte);
    apercuInformation.appendChild(entete);

    const texte = document.createElement("div");
    texte.className = "information-form__preview-content";
    texte.innerHTML = contenu || "<p>Le contenu de l’annonce apparaîtra ici.</p>";
    apercuInformation.appendChild(texte);
}

function ajouterOptionIllustration(image) {
    const option = document.createElement("option");
    option.value = image.nom;
    option.textContent = image.nom;
    illustration.appendChild(option);
}

for (const image of lesIllustrations) {
    ajouterOptionIllustration(image);
}

function afficherApercuIllustration() {
    const selection = lesIllustrations.find(image => image.nom === illustration.value);
    illustrationApercu.hidden = !selection;
    illustrationApercuVide.hidden = Boolean(selection);
    if (selection) {
        illustrationApercu.src = selection.url;
    } else {
        illustrationApercu.removeAttribute("src");
    }
    actualiserApercuInformation();
}

function mettreAJourBibliothequeImages(nomsFichiers) {
    const selectionActuelle = illustration.value;
    illustration.replaceChildren(new Option("Aucune image (logo par défaut)", ""));
    lesIllustrations.splice(0, lesIllustrations.length);

    for (const nom of nomsFichiers) {
        const image = {
            nom,
            url: `/data/photoinformation/${encodeURIComponent(nom)}`
        };
        lesIllustrations.push(image);
        ajouterOptionIllustration(image);
    }

    illustration.value = nomsFichiers.includes(selectionActuelle) ? selectionActuelle : "";
    afficherApercuIllustration();
}

async function televerserImageDansLeContenu(blobInfo, progress) {
    const donnees = new FormData();
    const nom = String(blobInfo.filename() || "image.jpg");
    donnees.append("fichier", blobInfo.blob(), nom);
    donnees.append(
        "bibliotheque",
        document.getElementById("ajouterImageBibliotheque")?.checked ? "1" : "0"
    );

    const resultat = await appelAjax({
        url: "ajax/ajouterillustration.php",
        data: donnees
    });
    if (!resultat || !resultat.url) {
        throw new Error("Impossible de téléverser l’image.");
    }

    if (resultat.bibliotheque) {
        if (!lesIllustrations.some(image => image.nom === resultat.nom)) {
            lesIllustrations.push({
                nom: resultat.nom,
                url: resultat.url
            });
            ajouterOptionIllustration(resultat);
        }
    }
    if (typeof progress === "function") {
        progress(100);
    }
    return resultat.url;
}

async function televerserIllustration() {
    const fichier = illustrationFichier.files[0];
    if (!fichier) {
        illustrationFichier.setCustomValidity("Choisissez une image à téléverser.");
        illustrationFichier.reportValidity();
        return;
    }

    const donnees = new FormData();
    donnees.append("fichier", fichier);
    donnees.append("bibliotheque", "1");
    btnTeleverserIllustration.disabled = true;

    try {
        const image = await appelAjax({
            url: "ajax/ajouterillustration.php",
            data: donnees
        });
        if (!image) {
            return;
        }

        ajouterOptionIllustration(image);
        illustration.value = image.nom;
        lesIllustrations.push(image);
        afficherApercuIllustration();
        illustrationFichier.value = "";
    } finally {
        btnTeleverserIllustration.disabled = false;
    }
}

function dateParDefaut() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formaterTailleFichier(taille) {
    return taille < 1024 * 1024
        ? `${Math.max(1, Math.round(taille / 1024))} Ko`
        : `${(taille / (1024 * 1024)).toFixed(1)} Mo`;
}

function afficherFichiersPdf() {
    listeFichiersPdf.replaceChildren();
    const fichiers = Array.from(fichiersPdf.files);
    if (fichiers.length === 0) {
        listeFichiersPdf.hidden = true;
        return;
    }

    listeFichiersPdf.hidden = false;
    for (const [index, fichier] of fichiers.entries()) {
        const ligne = document.createElement("li");
        ligne.className = "information-form__file-item";

        const details = document.createElement("span");
        details.className = "information-form__file-details";
        details.textContent = `${fichier.name} · ${formaterTailleFichier(fichier.size)}`;
        ligne.appendChild(details);

        const retirer = document.createElement("button");
        retirer.type = "button";
        retirer.className = "information-form__file-remove";
        retirer.textContent = "Retirer";
        retirer.setAttribute("aria-label", `Retirer le fichier ${fichier.name}`);
        retirer.addEventListener("click", () => {
            retirerPdfSelectionne(index);
            afficherFichiersPdf();
        });
        ligne.appendChild(retirer);
        listeFichiersPdf.appendChild(ligne);
    }
}

function setDescription(contenu) {
    description.value = contenu;
    const editeur = window.tinymce?.get("description");
    if (editeur) {
        editeur.setContent(contenu);
    }
    actualiserApercuInformation();
}

function nouvelleInformation() {
    formulaire.reset();
    idInformation.value = "0";
    illustrationFichier.setCustomValidity("");
    afficherFichiersPdf();
    dateExpiration.value = dateParDefaut();
    type.value = "publique";
    illustration.value = "";
    afficherApercuIllustration();
    setDescription("");
    titreFormulaire.textContent = "Ajouter une information";
    badgeModeInformation.textContent = "Création";
    leadFormulaire.textContent = "Complétez les informations essentielles, personnalisez l’illustration et joignez vos fichiers avant de publier.";
    panneauEditeur.classList.remove("information-admin-panel--editing");
    afficherEtape(1);
}

function modifierInformation(information) {
    fichiersPdf.value = "";
    afficherFichiersPdf();
    idInformation.value = information.idInformation;
    titre.value = information.titre;
    type.value = information.type;
    dateExpiration.value = information.dateExpiration;
    illustration.value = information.illustration ?? "";
    afficherApercuIllustration();
    setDescription(information.description);
    titreFormulaire.textContent = "Modifier une information";
    badgeModeInformation.textContent = "Modification";
    leadFormulaire.textContent = `Vous modifiez actuellement « ${information.titre} ».`;
    panneauEditeur.classList.add("information-admin-panel--editing");
    afficherEtape(1);
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

        if (information.documents.length > 0) {
            const lienDocuments = document.createElement("a");
            lienDocuments.className = "btn btn-sm btn-outline-secondary";
            lienDocuments.href = `documents.php?id=${encodeURIComponent(information.idInformation)}`;
            lienDocuments.textContent = `Gérer les PDF (${information.documents.length})`;
            actions.appendChild(lienDocuments);
        } else {
            const aucunPdf = document.createElement("span");
            aucunPdf.className = "btn btn-sm information-pdf-disabled";
            aucunPdf.setAttribute("aria-disabled", "true");
            aucunPdf.title = "Aucun document PDF associé";
            aucunPdf.textContent = "Gérer les PDF (0)";
            actions.appendChild(aucunPdf);
        }

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

function retirerPdfSelectionne(index) {
    const fichiers = Array.from(fichiersPdf.files);
    const fichiersRestants = new DataTransfer();
    fichiers.forEach((fichier, position) => {
        if (position !== index) {
            fichiersRestants.items.add(fichier);
        }
    });
    fichiersPdf.files = fichiersRestants.files;
}

async function televerserPdfsSelectionnes(id) {
    while (fichiersPdf.files.length > 0) {
        const fichier = fichiersPdf.files[0];
        const donnees = new FormData();
        donnees.append("idInformation", id);
        donnees.append("fichier", fichier);
        const reponse = await appelAjax({
            url: "documents/ajax/ajouter.php",
            data: donnees
        });
        if (!reponse) {
            return false;
        }
        retirerPdfSelectionne(0);
        afficherFichiersPdf();
    }
    return true;
}

document.getElementById("btnNouvelleInformation").addEventListener("click", () => {
    nouvelleInformation();
    formulaire.scrollIntoView({behavior: "smooth", block: "start"});
});
document.getElementById("btnAnnulerModification").addEventListener("click", nouvelleInformation);
btnEtapePrecedente.addEventListener("click", () => afficherEtape(etapeCourante - 1));
btnEtapeSuivante.addEventListener("click", () => {
    if (validerEtapeCourante()) {
        afficherEtape(etapeCourante + 1);
    }
});
titre.addEventListener("input", actualiserApercuInformation);
type.addEventListener("change", actualiserApercuInformation);
illustration.addEventListener("change", afficherApercuIllustration);
btnTeleverserIllustration.addEventListener("click", televerserIllustration);
illustrationFichier.addEventListener("change", () => illustrationFichier.setCustomValidity(""));
fichiersPdf.addEventListener("change", afficherFichiersPdf);
const canalImages = "BroadcastChannel" in window
    ? new BroadcastChannel("photoinformation-images")
    : null;
canalImages?.addEventListener("message", event => {
    if (event.data?.type !== "photoinformation:images-modifiees"
        || !Array.isArray(event.data.fichiers)
        || !event.data.fichiers.every(nom => typeof nom === "string")) {
        return;
    }
    mettreAJourBibliothequeImages(event.data.fichiers);
});

formulaire.addEventListener("submit", async event => {
    event.preventDefault();
    if (!validerEtapeCourante()) {
        return;
    }
    if (!formulaire.reportValidity()) {
        return;
    }

    const libelleBoutonEnregistrer = btnEnregistrerInformation.textContent;
    document.getElementById("msg").replaceChildren();
    btnEnregistrerInformation.disabled = true;
    btnEnregistrerInformation.textContent = "Enregistrement…";
    try {
        const editeur = window.tinymce?.get("description");
        const reponse = await appelAjax({
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
            }
        });
        if (!reponse) {
            return;
        }

        idInformation.value = reponse.idInformation;
        titreFormulaire.textContent = "Modifier une information";
        badgeModeInformation.textContent = "Modification";
        leadFormulaire.textContent = `Vous modifiez actuellement « ${titre.value.trim()} ».`;
        panneauEditeur.classList.add("information-admin-panel--editing");
        if (!await televerserPdfsSelectionnes(reponse.idInformation)) {
            return;
        }
        window.location.href = `documents.php?id=${encodeURIComponent(reponse.idInformation)}`;
    } finally {
        btnEnregistrerInformation.disabled = false;
        btnEnregistrerInformation.textContent = libelleBoutonEnregistrer;
    }
});

function initialiserEditeurDescription() {
    window.tinymce.init({
        license_key: "gpl",
        selector: "#description",
        menubar: false,
        plugins: "link image lists table autoresize code quickbars",
        toolbar: "undo redo | bold italic underline | alignleft aligncenter alignright | link image | bullist numlist | table | removeformat | code",
        toolbar_location: "top",
        toolbar_mode: "wrap",
        toolbar_sticky: false,
        ui_mode: "combined",
        quickbars_selection_toolbar: "bold italic underline | link | alignleft aligncenter alignright",
        quickbars_insert_toolbar: "image bullist numlist",
        height: 500,
        min_height: 500,
        object_resizing: "img",
        resize: true,
        contextmenu: "link image table",
        image_title: true,
        image_caption: true,
        image_advtab: false,
        content_style: `
            .information-image { max-width: 100%; height: auto; }
            .information-image--left { float: left; width: 35%; margin: 0.25rem 1rem 0.75rem 0; }
            .information-image--right { float: right; width: 35%; margin: 0.25rem 0 0.75rem 1rem; }
            .information-image--center { display: block; width: 75%; margin: 1rem auto; }
        `,
        automatic_uploads: true,
        paste_data_images: true,
        file_picker_types: "image",
        images_upload_handler: televerserImageDansLeContenu
    }).then(() => {
        const editeur = window.tinymce.get("description");
        editeur?.setContent(description.value);
        editeur?.on("input", actualiserApercuInformation);
        editeur?.on("change", actualiserApercuInformation);
        editeur?.on("NodeChange", actualiserApercuInformation);
    });
}

dateExpiration.value = dateParDefaut();
afficherListe();
afficherFichiersPdf();
afficherEtape(1);
