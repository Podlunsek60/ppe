USE ppe;

DROP EVENT IF EXISTS supprimer_informations_obsoletes;

DELIMITER //

CREATE EVENT supprimer_informations_obsoletes
    ON SCHEDULE EVERY 1 DAY
        STARTS TIMESTAMP(CURRENT_DATE + INTERVAL 1 DAY, '00:00:00')
    ON COMPLETION PRESERVE
    ENABLE
    DO
    BEGIN
        DELETE FROM information
        WHERE dateExpiration < CURRENT_DATE();
    END//
