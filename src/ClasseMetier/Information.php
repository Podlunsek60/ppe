<?php
declare(strict_types=1);

namespace ClasseMetier;

use ClasseTechnique\Database;
use ClasseTechnique\FileManager;
use ClasseTechnique\Std;
use ClasseTechnique\UserException;
use PDO;

/** Gestion des informations publiées et de leurs documents PDF. */
final class Information
{
    private const array TYPES = ['publique', 'privée'];
    private const array EXTENSIONS_ILLUSTRATION = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];

    public static function verifierDroitAdministration(): void
    {
        $idMembre = $_SESSION['membre']['id'] ?? null;
        if ($idMembre === null || !Administrateur::peutAdministrer((int)$idMembre, 'information')) {
            throw new UserException("Vous n'êtes pas autorisé à gérer les informations.");
        }
    }

    public static function verifierDroitPhototheque(): void
    {
        $idMembre = $_SESSION['membre']['id'] ?? null;
        if ($idMembre === null || !Administrateur::peutAdministrer((int)$idMembre, 'photoinformation')) {
            throw new UserException("Vous n'êtes pas autorisé à gérer la photothèque.");
        }
    }

    public static function illustrationEstUtilisee(string $nomIllustration): bool
    {
        $curseur = Database::getInstance()->prepare(
            <<<'SQL'
                SELECT 1
                FROM information
                WHERE illustration = :illustration
                   OR LOCATE(:urlIllustration, description) > 0
                LIMIT 1
SQL
        );
        $curseur->execute([
            'illustration' => $nomIllustration,
            'urlIllustration' => '/data/photoinformation/' . rawurlencode($nomIllustration),
        ]);
        return (bool)$curseur->fetchColumn();
    }

    /** @return list<array<string, mixed>> */
    public static function getAllAdmin(): array
    {
        self::supprimerLesObsoletes();
        $sql = <<<'SQL'
            SELECT idInformation, titre, description, illustration, type, datePublication, dateExpiration
            FROM information
            ORDER BY datePublication DESC, idInformation DESC
SQL;
        $informations = Database::getInstance()->query($sql)->fetchAll();
        return self::ajouterLesDocuments($informations);
    }

    /** @return list<array<string, mixed>> */
    public static function getLesInformationsVisibles(bool $membreConnecte, int $limite = 50): array
    {
        self::supprimerLesObsoletes();
        $limite = max(1, min($limite, 100));
        $sql = <<<SQL
            SELECT idInformation, titre, description, illustration, type, datePublication, dateExpiration
            FROM information
            WHERE dateExpiration >= CURDATE()
              AND (:membreConnecte = 1 OR type = 'publique')
            ORDER BY datePublication DESC, idInformation DESC
            LIMIT :limite
SQL;
        $curseur = Database::getInstance()->prepare($sql);
        $curseur->bindValue('membreConnecte', $membreConnecte, PDO::PARAM_BOOL);
        $curseur->bindValue('limite', $limite, PDO::PARAM_INT);
        $curseur->execute();
        return self::ajouterLesDocuments($curseur->fetchAll());
    }

    /** @return array<string, mixed>|null */
    public static function getParId(int $idInformation): ?array
    {
        self::supprimerLesObsoletes();
        $sql = <<<'SQL'
            SELECT idInformation, titre, description, illustration, type, datePublication, dateExpiration
            FROM information
            WHERE idInformation = :idInformation
              AND dateExpiration >= CURDATE()
SQL;
        $curseur = Database::getInstance()->prepare($sql);
        $curseur->execute(['idInformation' => $idInformation]);
        $information = $curseur->fetch();
        if (!$information) {
            return null;
        }

        $informations = self::ajouterLesDocuments([$information]);
        return $informations[0];
    }

    /** @param array<string, mixed> $colonnes */
    public static function enregistrer(array $colonnes): int
    {
        $titre = Std::nettoyerTitre(self::champTexte($colonnes, 'titre'));
        $description = Std::nettoyerHtml(self::champTexte($colonnes, 'description'));
        $illustration = self::champTexte($colonnes, 'illustration');
        $type = self::champTexte($colonnes, 'type');
        $dateExpiration = self::champTexte($colonnes, 'dateExpiration');

        if (!Std::titreValide($titre, 150)) {
            throw new UserException('Le titre est obligatoire et ne doit pas dépasser 150 caractères.');
        }
        $texteDescription = Std::supprimerEspace(
            html_entity_decode(strip_tags($description), ENT_QUOTES | ENT_HTML5, 'UTF-8')
        );
        if ($texteDescription === '' && preg_match('/<img\b/i', $description) !== 1) {
            throw new UserException('Le contenu de l’information est obligatoire.');
        }
        if (!in_array($type, self::TYPES, true)) {
            throw new UserException('Le type doit être public ou privé.');
        }
        if ($illustration !== ''
            && (!preg_match('/^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/D', $illustration)
                || !in_array(strtolower(pathinfo($illustration, PATHINFO_EXTENSION)), self::EXTENSIONS_ILLUSTRATION, true)
                || !is_file(DOSSIER_PHOTO_INFORMATION . DIRECTORY_SEPARATOR . $illustration))) {
            throw new UserException('L’image sélectionnée n’existe pas dans la bibliothèque.');
        }
        if (!Std::dateMysqlValide($dateExpiration) || $dateExpiration < date('Y-m-d')) {
            throw new UserException('La date d’expiration doit être aujourd’hui ou ultérieure.');
        }

        $idInformation = filter_var($colonnes['idInformation'] ?? 0, FILTER_VALIDATE_INT);
        if ($idInformation === false || $idInformation < 0) {
            throw new UserException('Identifiant d’information invalide.');
        }

        $db = Database::getInstance();
        if ($idInformation === 0) {
            $sql = <<<'SQL'
                INSERT INTO information (titre, description, illustration, type, dateExpiration)
                VALUES (:titre, :description, :illustration, :type, :dateExpiration)
SQL;
            $curseur = $db->prepare($sql);
            $curseur->execute([
                'titre' => $titre,
                'description' => $description,
                'illustration' => $illustration === '' ? null : $illustration,
                'type' => $type,
                'dateExpiration' => $dateExpiration,
            ]);
            return (int)$db->lastInsertId();
        }

        $sql = <<<'SQL'
            UPDATE information
            SET titre = :titre,
                description = :description,
                illustration = :illustration,
                type = :type,
                dateExpiration = :dateExpiration
            WHERE idInformation = :idInformation
SQL;
        $curseur = $db->prepare($sql);
        $curseur->execute([
            'titre' => $titre,
            'description' => $description,
            'illustration' => $illustration === '' ? null : $illustration,
            'type' => $type,
            'dateExpiration' => $dateExpiration,
            'idInformation' => $idInformation,
        ]);
        if ($curseur->rowCount() === 0 && !self::existe($idInformation)) {
            throw new UserException('Cette information n’existe plus.');
        }

        return $idInformation;
    }

    public static function supprimer(int $idInformation): void
    {
        $db = Database::getInstance();
        $documents = self::getDocumentsSansInformation($idInformation);
        $curseur = $db->prepare('DELETE FROM information WHERE idInformation = :idInformation');
        $curseur->execute(['idInformation' => $idInformation]);
        if ($curseur->rowCount() === 0) {
            throw new UserException('Cette information n’existe plus.');
        }
        self::supprimerLesFichiers($documents);
    }

    public static function ajouterDocument(int $idInformation, string $nomDocument, string $nomStocke): int
    {
        if (self::getParId($idInformation) === null) {
            throw new UserException('Cette information n’existe plus ou a expiré.');
        }
        $sql = <<<'SQL'
            INSERT INTO documentinformation (idInformation, nomDocument, nomStocke)
            VALUES (:idInformation, :nomDocument, :nomStocke)
SQL;
        $curseur = Database::getInstance()->prepare($sql);
        $curseur->execute([
            'idInformation' => $idInformation,
            'nomDocument' => $nomDocument,
            'nomStocke' => $nomStocke,
        ]);
        return (int)Database::getInstance()->lastInsertId();
    }

    public static function supprimerDocument(int $idInformation, int $idDocument): void
    {
        $sql = <<<'SQL'
            SELECT nomStocke
            FROM documentinformation
            WHERE idInformation = :idInformation
              AND idDocument = :idDocument
SQL;
        $curseur = Database::getInstance()->prepare($sql);
        $curseur->execute(['idInformation' => $idInformation, 'idDocument' => $idDocument]);
        $document = $curseur->fetch();
        if (!$document) {
            throw new UserException('Ce document n’est pas associé à cette information.');
        }

        $curseur = Database::getInstance()->prepare(
            'DELETE FROM documentinformation WHERE idInformation = :idInformation AND idDocument = :idDocument'
        );
        $curseur->execute(['idInformation' => $idInformation, 'idDocument' => $idDocument]);
        self::supprimerLesFichiers([$document]);
    }

    /** @return array<string, mixed>|null */
    public static function obtenirDocumentVisible(int $idDocument, bool $membreConnecte): ?array
    {
        self::supprimerLesObsoletes();
        $sql = <<<SQL
            SELECT d.idDocument, d.nomDocument, d.nomStocke, i.type
            FROM documentinformation d
            JOIN information i ON i.idInformation = d.idInformation
            WHERE d.idDocument = :idDocument
              AND i.dateExpiration >= CURDATE()
              AND (:membreConnecte = 1 OR i.type = 'publique')
SQL;
        $db = Database::getInstance();
        $curseur = $db->prepare($sql);
        $curseur->bindValue('idDocument', $idDocument, PDO::PARAM_INT);
        $curseur->bindValue('membreConnecte', $membreConnecte, PDO::PARAM_BOOL);
        $curseur->execute();
        $document = $curseur->fetch();
        if (!$document) {
            return null;
        }

        $curseur = $db->prepare(
            'UPDATE documentinformation SET consultations = consultations + 1 WHERE idDocument = :idDocument'
        );
        $curseur->execute(['idDocument' => $idDocument]);
        return $document;
    }

    /** Supprime automatiquement le contenu expiré lors de la consultation du module. */
    private static function supprimerLesObsoletes(): void
    {
        $db = Database::getInstance();
        $sql = <<<'SQL'
            SELECT d.nomStocke
            FROM documentinformation d
            JOIN information i ON i.idInformation = d.idInformation
            WHERE i.dateExpiration < CURDATE()
SQL;
        $documents = $db->query($sql)->fetchAll();
        $db->exec('DELETE FROM information WHERE dateExpiration < CURDATE()');
        self::supprimerLesFichiers($documents);
    }

    /**
     * @param list<array<string, mixed>> $informations
     * @return list<array<string, mixed>>
     */
    private static function ajouterLesDocuments(array $informations): array
    {
        if ($informations === []) {
            return [];
        }

        $ids = array_map(static fn(array $information): int => (int)$information['idInformation'], $informations);
        $marqueurs = implode(',', array_fill(0, count($ids), '?'));
        $sql = "SELECT idInformation, idDocument, nomDocument, consultations FROM documentinformation WHERE idInformation IN ($marqueurs) ORDER BY nomDocument";
        $curseur = Database::getInstance()->prepare($sql);
        $curseur->execute($ids);

        $documentsParInformation = [];
        foreach ($curseur->fetchAll() as $document) {
            $documentsParInformation[(int)$document['idInformation']][] = $document;
        }

        foreach ($informations as &$information) {
            $information['description'] = Std::nettoyerHtml((string)$information['description']);
            $information['documents'] = $documentsParInformation[(int)$information['idInformation']] ?? [];
        }
        unset($information);

        return $informations;
    }

    /** @return list<array<string, mixed>> */
    private static function getDocumentsSansInformation(int $idInformation): array
    {
        $curseur = Database::getInstance()->prepare(
            'SELECT nomStocke FROM documentinformation WHERE idInformation = :idInformation'
        );
        $curseur->execute(['idInformation' => $idInformation]);
        return $curseur->fetchAll();
    }

    /** @param list<array<string, mixed>> $documents */
    private static function supprimerLesFichiers(array $documents): void
    {
        $gestionnaire = new FileManager(DOSSIER_DOCUMENT_INFORMATION);
        foreach ($documents as $document) {
            if (!$gestionnaire->supprimer((string)$document['nomStocke'])) {
                throw new UserException('Un document associé n’a pas pu être supprimé du disque.');
            }
        }
    }

    private static function existe(int $idInformation): bool
    {
        $curseur = Database::getInstance()->prepare(
            'SELECT 1 FROM information WHERE idInformation = :idInformation'
        );
        $curseur->execute(['idInformation' => $idInformation]);
        return (bool)$curseur->fetchColumn();
    }

    /** @param array<string, mixed> $colonnes */
    private static function champTexte(array $colonnes, string $nom): string
    {
        $valeur = $colonnes[$nom] ?? '';
        if (!is_string($valeur)) {
            throw new UserException("La valeur du champ '$nom' est invalide.");
        }
        return $valeur;
    }
}
