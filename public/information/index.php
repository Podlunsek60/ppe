<?php
declare(strict_types=1);

use ClasseMetier\Information;
use ClasseTechnique\Page;

/** @noinspection PhpIncludeInspection */
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

$page = new Page();
$page->setTitre('Toutes les informations')
    ->setDonnee('lesInformations', Information::getLesInformationsVisibles(isset($_SESSION['membre']), 100))
    ->afficher();