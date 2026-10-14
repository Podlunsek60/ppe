<?php
declare(strict_types=1);

use ClasseMetier\Information;
use ClasseTechnique\Config;
use ClasseTechnique\FileManager;
use ClasseTechnique\InputFile;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;
use ClasseTechnique\UserException;

require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

Requete::exigerPost();
Information::verifierDroitAdministration();
$idInformation = Requete::postInt('idInformation');
$fichier = Requete::getFile('fichier');
$input = new InputFile($fichier, Config::chargerPhp('documentinformation'));
if (!$input->checkValidity()) {
    throw new UserException($input->getValidationMessage() ?: 'Le document PDF est invalide.');
}
if (mb_strlen($input->getValue(), 'UTF-8') > 255) {
    throw new UserException('Le nom du fichier ne doit pas dépasser 255 caractères.');
}
$debutFichier = file_get_contents($input->getTmpName(), false, null, 0, 1024);
if ($debutFichier === false || !str_starts_with(ltrim($debutFichier), '%PDF-')) {
    throw new UserException('Le fichier transmis n’est pas un document PDF valide.');
}
if (!is_dir(DOSSIER_DOCUMENT_INFORMATION)
    && !mkdir(DOSSIER_DOCUMENT_INFORMATION, 0750, true)
    && !is_dir(DOSSIER_DOCUMENT_INFORMATION)) {
    throw new UserException('Le dossier de stockage des documents ne peut pas être créé.');
}
if (!is_writable(DOSSIER_DOCUMENT_INFORMATION)) {
    throw new UserException('Le dossier de stockage des documents n’est pas accessible en écriture.');
}

$gestionnaire = new FileManager(DOSSIER_DOCUMENT_INFORMATION);
$nomStocke = bin2hex(random_bytes(18)) . '.pdf';
$gestionnaire->copier($input->getTmpName(), $nomStocke);
try {
    $idDocument = Information::ajouterDocument($idInformation, $input->getValue(), $nomStocke);
} catch (\Throwable $erreur) {
    if (!$gestionnaire->supprimer($nomStocke)) {
        throw new UserException('Le document a été téléversé mais son enregistrement a échoué et son nettoyage a échoué.');
    }
    throw $erreur;
}

ReponseJson::envoyer(['idDocument' => $idDocument]);