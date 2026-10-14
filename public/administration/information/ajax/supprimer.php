<?php
declare(strict_types=1);

use ClasseMetier\Information;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;

require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

Requete::exigerPost();
Information::verifierDroitAdministration();
Information::supprimer(Requete::postInt('idInformation'));

ReponseJson::envoyerMessage('Information supprimée.');