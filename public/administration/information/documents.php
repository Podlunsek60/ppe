<?php
declare(strict_types=1);

use ClasseMetier\Information;
use ClasseTechnique\Page;
use ClasseTechnique\Requete;
use ClasseTechnique\UserException;

require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

$idInformation = Requete::getInt('id');
if ($idInformation < 1) {
    throw new UserException('Identifiant d’information invalide.');
}

$information = Information::getParId($idInformation);
if ($information === null) {
    throw new UserException('Cette information n’existe plus ou a expiré.');
}

$page = new Page();
$page->setTitre('Documents de l’information')
    ->setDonnee('information', $information)
    ->avecJeton()
    ->afficher();