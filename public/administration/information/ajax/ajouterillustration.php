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

try {
    Requete::exigerPost();
    Information::verifierDroitAdministration();

    $fichier = Requete::getFile('fichier');
    $bibliotheque = Requete::postNullableBool('bibliotheque') === true;
    $parametres = Config::chargerPhp('image');
    $input = new InputFileImg($fichier, $parametres);
    if (!$input->checkValidity()) {
        throw new UserException($input->getValidationMessage() ?: 'Le fichier image est invalide.');
    }

    $dossierDestination = $bibliotheque
        ? DOSSIER_PHOTO_INFORMATION
        : DOSSIER_IMAGE_CONTENU_INFORMATION;
    $preludeUrl = $bibliotheque
        ? '/data/photoinformation/'
        : '/data/informationcontenu/';

    if (!is_dir($dossierDestination)
        && !mkdir($dossierDestination, 0750, true)
        && !is_dir($dossierDestination)) {
        throw new UserException('Le dossier de stockage des images ne peut pas être créé.');
    }
    if (!is_writable($dossierDestination)) {
        throw new UserException('Le dossier de stockage des images n’est pas accessible en écriture.');
    }

    $gestionnaire = new ImageManager($dossierDestination, $parametres);
    $nomImage = $gestionnaire->genererNomUnique($input->getValue());
    $nomImage = $gestionnaire->copierImage($input, $nomImage);

    ReponseJson::envoyerLesDonnees([
        'nom' => $nomImage,
        'url' => $preludeUrl . rawurlencode($nomImage),
        'bibliotheque' => $bibliotheque,
    ]);
} catch (UserException $e) {
    ReponseJson::envoyerErreur($e->getMessage(), $e->getCodeHttp());
} catch (Throwable $e) {
    ClasseTechnique\Journal::enregistrer(
        sprintf(
            '[%s] %s | code : %s | fichier : %s | ligne : %d',
            $e::class,
            $e->getMessage(),
            $e->getCode(),
            $e->getFile(),
            $e->getLine()
        ),
        'erreur'
    );
    ReponseJson::envoyerErreur(
        'Une erreur technique est survenue, veuillez réessayer ultérieurement.',
        500
    );
}
