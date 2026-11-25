<?php
declare(strict_types=1);

use ClasseMetier\Information;
use ClasseTechnique\Page;
use ClasseTechnique\Requete;

require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

$idInformation = Requete::getInt('id');
$information = Information::getParId($idInformation);

if ($information === null
    || ($information['type'] === 'privée' && !isset($_SESSION['membre']))) {
    http_response_code(404);
    require __DIR__ . '/../erreur/404.php';
    exit;
}

$page = new Page();
$page->setTitre((string)$information['titre'])
    ->addStyle('/information/index.css')
    ->setDonnee('information', $information)
    ->afficher();
