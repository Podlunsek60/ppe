<?php
declare(strict_types=1);

use ClasseMetier\Information;
use ClasseTechnique\Requete;

require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

$idDocument = Requete::getInt('id');
$document = Information::obtenirDocumentVisible($idDocument, isset($_SESSION['membre']));
if ($document === null) {
    http_response_code(404);
    exit('Document introuvable.');
}

$chemin = DOSSIER_DOCUMENT_INFORMATION . DIRECTORY_SEPARATOR . basename((string)$document['nomStocke']);
if (!is_file($chemin) || !is_readable($chemin)) {
    http_response_code(404);
    exit('Document introuvable.');
}
$taille = filesize($chemin);
if ($taille === false) {
    http_response_code(404);
    exit('Document introuvable.');
}

while (ob_get_level() > 0) {
    ob_end_clean();
}
session_write_close();
$nom = (string)$document['nomDocument'];
$nomAscii = preg_replace('/[^A-Za-z0-9._-]/', '_', $nom) ?: 'document.pdf';
header('Content-Type: application/pdf');
header('Content-Length: ' . $taille);
header('Content-Disposition: inline; filename="' . $nomAscii . '"; filename*=UTF-8\'\'' . rawurlencode($nom));
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, no-store');
readfile($chemin);
exit;