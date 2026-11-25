<?php
declare(strict_types=1);

use ClasseMetier\Information;
use ClasseTechnique\Config;
use ClasseTechnique\ImageManager;
use ClasseTechnique\InputFileImg;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;
use ClasseTechnique\UserException;

require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

Requete::exigerPost();
Information::verifierDroitPhototheque();
$fichier = Requete::getFile('fichier');
$lesParametres = Config::chargerPhp('image');
$inputFileImg = new InputFileImg($fichier, $lesParametres);
if (!$inputFileImg->checkValidity()) {
    throw new UserException($inputFileImg->getValidationMessage() ?: "Le fichier image n'est pas valide.");
}

if (!is_dir(DOSSIER_PHOTO_INFORMATION)
    && !mkdir(DOSSIER_PHOTO_INFORMATION, 0750, true)
    && !is_dir(DOSSIER_PHOTO_INFORMATION)) {
    throw new UserException('Le dossier de stockage des images ne peut pas être créé.');
}
if (!is_writable(DOSSIER_PHOTO_INFORMATION)) {
    throw new UserException('Le dossier de stockage des images n’est pas accessible en écriture.');
}

$imageManager = new ImageManager(DOSSIER_PHOTO_INFORMATION, $lesParametres);
$nomUnique = $imageManager->genererNomUnique($inputFileImg->getValue());
$imageManager->copierImage($inputFileImg, $nomUnique);

ReponseJson::envoyerLesDonnees($imageManager->getLesFichiers());