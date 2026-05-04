-- ============================================================
--  TRIGGERS CORREGIDOS para Siete Store
--  - Descuento de stock sin race condition
--  - Restauración de stock al anular venta
--  Motor: MySQL 8.x
-- ============================================================

USE siete_store;

DELIMITER $$

-- ============================================================
-- TRIGGER 1: Descontar stock al INSERTAR detalle de venta
-- CORREGIDO: usa UPDATE con condición y verifica filas afectadas
-- ============================================================
CREATE TRIGGER trg_descontar_stock
AFTER INSERT ON detalle_venta
FOR EACH ROW
BEGIN
    -- Intentar descontar SOLO si hay suficiente stock
    UPDATE inventario
    SET cantidad = cantidad - NEW.cantidad
    WHERE id_producto = NEW.id_producto AND cantidad >= NEW.cantidad;

    -- Si no se afectó ninguna fila, el stock es insuficiente
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT(
            'Stock insuficiente para el producto ID: ', NEW.id_producto,
            '. Cantidad solicitada: ', NEW.cantidad
        );
    END IF;

    -- Registrar el movimiento de salida (trazabilidad)
    -- NOTA: Asumimos que la venta ya está confirmada al insertar detalles.
    -- Si no es así, ajusta según la lógica de tu aplicación.
    INSERT INTO movimiento_inventario (id_producto, tipo_movimiento, cantidad, motivo, id_usuario)
    SELECT
        NEW.id_producto,
        'SALIDA',
        NEW.cantidad,
        CONCAT('Venta #', NEW.id_venta),
        v.id_usuario
    FROM venta v
    WHERE v.id_venta = NEW.id_venta;
END$$

-- ============================================================
-- TRIGGER 2: Restaurar stock si una venta se ANULA
-- (sin cambios, ya estaba bien)
-- ============================================================
CREATE TRIGGER trg_restaurar_stock_anulacion
AFTER UPDATE ON venta
FOR EACH ROW
BEGIN
    -- Solo actúa cuando el estado cambia de COMPLETADA a ANULADA
    IF OLD.estado = 'COMPLETADA' AND NEW.estado = 'ANULADA' THEN

        -- Devolver las unidades al inventario por cada ítem de la venta
        UPDATE inventario i
        JOIN detalle_venta dv ON dv.id_producto = i.id_producto
        SET i.cantidad = i.cantidad + dv.cantidad
        WHERE dv.id_venta = NEW.id_venta;

        -- Registrar movimientos de entrada (reversión) en la trazabilidad
        INSERT INTO movimiento_inventario (id_producto, tipo_movimiento, cantidad, motivo, id_usuario)
        SELECT
            dv.id_producto,
            'ENTRADA',
            dv.cantidad,
            CONCAT('Anulación venta #', NEW.id_venta),
            NEW.id_usuario
        FROM detalle_venta dv
        WHERE dv.id_venta = NEW.id_venta;

    END IF;
END$$

DELIMITER ;

-- ============================================================
-- VERIFICACIÓN RÁPIDA (opcional)
-- ============================================================
-- SHOW TRIGGERS FROM siete_store;