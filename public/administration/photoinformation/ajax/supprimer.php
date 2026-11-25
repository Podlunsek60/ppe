<?php
declare(strict_types=1);

use ClasseMetier\Information;
use ClasseTechnique\FileManager;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;
use ClasseTechnique\UserException;

require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

Requete::exigerPost();
Information::verifierDroitPhototheque();
$nomFichier = Requete::postString('nomFichier');

if (Information::illustrationEstUtilisee($nomFichier)) {
    throw new UserException('Cette image est utilisée par une information et ne peut pas être supprimée.');
}

$fileManager = new FileManager(DOSSIER_PHOTO_INFORMATION);
if (!$fileManager->supprimer($nomFichier)) {
    throw new UserException('Le fichier image n’a pas pu être supprimé.');
}

ReponseJson::envoyerLesDonnees($fileManager->getLesFichiers());