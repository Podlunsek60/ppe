<?php
declare(strict_types=1);

use ClasseMetier\Information;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;

require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

Requete::exigerPost();
Information::verifierDroitAdministration();

$idInformation = Information::enregistrer(Requete::postArray('columns'));
ReponseJson::envoyer(['idInformation' => $idInformation]);