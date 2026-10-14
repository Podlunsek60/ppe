USE ppe;

CREATE TABLE IF NOT EXISTS information
(
    idInformation   INT          NOT NULL AUTO_INCREMENT,
    titre           VARCHAR(150) NOT NULL,
    description     MEDIUMTEXT   NOT NULL,
    illustration    VARCHAR(255) NULL,
    type            ENUM('publique', 'privée') NOT NULL,
    datePublication DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dateExpiration  DATE         NOT NULL,

    CONSTRAINT pk_information
        PRIMARY KEY (idInformation),

    CONSTRAINT ck_information_titre
        CHECK (CHAR_LENGTH(TRIM(titre)) BETWEEN 1 AND 150),

    CONSTRAINT ck_information_description
        CHECK (CHAR_LENGTH(TRIM(description)) > 0),

    INDEX idx_information_expiration (dateExpiration),
    INDEX idx_information_publication (datePublication)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documentinformation
(
    idDocument    INT          NOT NULL AUTO_INCREMENT,
    idInformation INT          NOT NULL,
    nomDocument   VARCHAR(255) NOT NULL,
    nomStocke     VARCHAR(40)  NOT NULL,
    consultations INT UNSIGNED NOT NULL DEFAULT 0,

    CONSTRAINT pk_documentinformation
        PRIMARY KEY (idDocument),

    CONSTRAINT uk_documentinformation_stocke
        UNIQUE (nomStocke),

    CONSTRAINT fk_documentinformation_information
        FOREIGN KEY (idInformation)
            REFERENCES information (idInformation)
            ON DELETE CASCADE,

    INDEX idx_documentinformation_information (idInformation)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON ppe.information
    TO 'ppe'@'localhost';

GRANT SELECT, INSERT, UPDATE, DELETE
    ON ppe.documentinformation
    TO 'ppe'@'localhost';