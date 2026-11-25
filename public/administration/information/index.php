<?php
declare(strict_types=1);

use ClasseMetier\Information;
use ClasseTechnique\Std;
use ClasseTechnique\Page;

/** @noinspection PhpIncludeInspection */
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

$lesNomsImages = Std::getLesFichiers(DOSSIER_PHOTO_INFORMATION, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']);
$lesIllustrations = array_map(
    static fn(string $photo): array => [
        'nom' => $photo,
        'url' => '/data/photoinformation/' . rawurlencode($photo),
    ],
    $lesNomsImages
);

$page = new Page();
$page->setTitre('Gestion des informations')
    ->addScript('/composant/tinymce/tinymce.min.js')
    ->setDonnee('lesInformations', Information::getAllAdmin())
    ->setDonnee('lesIllustrations', $lesIllustrations)
    ->avecJeton()
    ->afficher();