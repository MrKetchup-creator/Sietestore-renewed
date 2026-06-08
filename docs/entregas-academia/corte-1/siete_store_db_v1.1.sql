-- ============================================================
--  BASE DE DATOS: Siete Store (versión corregida)
--  Sistema de gestión de ventas, inventario y reportes
--  Motor: MySQL 8
--  Correcciones: índices adicionales, mejoras de integridad
-- ============================================================

CREATE DATABASE IF NOT EXISTS siete_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE siete_store;

-- ============================================================
-- 1. USUARIOS / EMPLEADOS (autenticación y control de acceso)
-- ============================================================
CREATE TABLE usuario (
    id_usuario      INT UNSIGNED      AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)      NOT NULL,
    correo          VARCHAR(150)      NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255)      NOT NULL,           -- bcrypt / SHA2
    rol             ENUM('ADMIN','EMPLEADO') NOT NULL DEFAULT 'EMPLEADO',
    activo          TINYINT(1)        NOT NULL DEFAULT 1,
    creado_en       DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. PROVEEDORES
-- ============================================================
CREATE TABLE proveedor (
    id_proveedor    INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(150)  NOT NULL,
    telefono        VARCHAR(20),
    correo          VARCHAR(150),
    direccion       VARCHAR(255),
    activo          TINYINT(1)    NOT NULL DEFAULT 1,
    creado_en       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. CATEGORÍAS DE PRODUCTO (Dama, Caballero, Gorras)
-- ============================================================
CREATE TABLE categoria (
    id_categoria    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(50)  NOT NULL UNIQUE,
    descripcion     VARCHAR(255)
);

-- ============================================================
-- 4. TIPOS DE PRENDA (Camisa, Pantalón, etc.)
-- ============================================================
CREATE TABLE tipo_prenda (
    id_tipo         TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(60)  NOT NULL UNIQUE
);

-- ============================================================
-- 5. PRODUCTOS (catálogo maestro)
-- ============================================================
CREATE TABLE producto (
    id_producto     INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    codigo          VARCHAR(30)   NOT NULL UNIQUE,
    nombre          VARCHAR(120)  NOT NULL,
    descripcion     TEXT,
    id_categoria    TINYINT UNSIGNED NOT NULL,
    id_tipo         TINYINT UNSIGNED NOT NULL,
    talla           VARCHAR(10),
    color           VARCHAR(40),
    marca           VARCHAR(60),
    precio_venta    DECIMAL(10,2) NOT NULL CHECK (precio_venta >= 0),
    costo           DECIMAL(10,2) NOT NULL CHECK (costo >= 0),
    id_proveedor    INT UNSIGNED,
    activo          TINYINT(1)    NOT NULL DEFAULT 1,
    creado_en       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_prod_categoria FOREIGN KEY (id_categoria)
        REFERENCES categoria (id_categoria),
    CONSTRAINT fk_prod_tipo      FOREIGN KEY (id_tipo)
        REFERENCES tipo_prenda (id_tipo),
    CONSTRAINT fk_prod_proveedor FOREIGN KEY (id_proveedor)
        REFERENCES proveedor (id_proveedor)
);

-- ============================================================
-- 6. INVENTARIO (stock y control de mínimos)
-- ============================================================
CREATE TABLE inventario (
    id_inventario   INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    id_producto     INT UNSIGNED  NOT NULL UNIQUE,
    cantidad        INT           NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    stock_minimo    INT           NOT NULL DEFAULT 5  CHECK (stock_minimo >= 0),
    ubicacion       VARCHAR(100),
    fecha_ingreso   DATE,
    actualizado_en  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_inv_producto FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto) ON DELETE RESTRICT
);

-- ============================================================
-- 7. MOVIMIENTOS DE INVENTARIO (trazabilidad)
-- ============================================================
CREATE TABLE movimiento_inventario (
    id_movimiento   INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    id_producto     INT UNSIGNED  NOT NULL,
    tipo_movimiento ENUM('ENTRADA','SALIDA','AJUSTE') NOT NULL,
    cantidad        INT           NOT NULL,
    motivo          VARCHAR(150),
    id_usuario      INT UNSIGNED,
    registrado_en   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mov_producto FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto),
    CONSTRAINT fk_mov_usuario  FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
);

-- ============================================================
-- 8. CLIENTES (opcional)
-- ============================================================
CREATE TABLE cliente (
    id_cliente      INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(120)  NOT NULL,
    num_identificacion VARCHAR(20) UNIQUE,
    telefono        VARCHAR(20),
    correo          VARCHAR(150),
    direccion       VARCHAR(255),
    creado_en       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 9. VENTAS (cabecera)
-- ============================================================
CREATE TABLE venta (
    id_venta        INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    fecha_hora      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario      INT UNSIGNED  NOT NULL,
    id_cliente      INT UNSIGNED,
    metodo_pago     ENUM('EFECTIVO','TARJETA','TRANSFERENCIA') NOT NULL,
    total           DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    estado          ENUM('COMPLETADA','ANULADA') NOT NULL DEFAULT 'COMPLETADA',
    observaciones   VARCHAR(255),

    CONSTRAINT fk_venta_usuario  FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario),
    CONSTRAINT fk_venta_cliente  FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente)
);

-- ============================================================
-- 10. DETALLE DE VENTA
-- ============================================================
CREATE TABLE detalle_venta (
    id_detalle      INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    id_venta        INT UNSIGNED  NOT NULL,
    id_producto     INT UNSIGNED  NOT NULL,
    cantidad        INT           NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal        DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,

    CONSTRAINT fk_det_venta    FOREIGN KEY (id_venta)
        REFERENCES venta (id_venta) ON DELETE CASCADE,
    CONSTRAINT fk_det_producto FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto)
);

-- ============================================================
-- 11. RELACIÓN PROVEEDOR ↔ PRODUCTO (M:N)
-- ============================================================
CREATE TABLE proveedor_producto (
    id_proveedor    INT UNSIGNED NOT NULL,
    id_producto     INT UNSIGNED NOT NULL,
    PRIMARY KEY (id_proveedor, id_producto),

    CONSTRAINT fk_pp_proveedor FOREIGN KEY (id_proveedor)
        REFERENCES proveedor (id_proveedor),
    CONSTRAINT fk_pp_producto  FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto)
);

-- ============================================================
-- ÍNDICES ADICIONALES (mejoras de rendimiento)
-- ============================================================
CREATE INDEX idx_venta_fecha            ON venta (fecha_hora);
CREATE INDEX idx_venta_metodo           ON venta (metodo_pago);
CREATE INDEX idx_venta_cliente          ON venta (id_cliente);
CREATE INDEX idx_venta_estado_fecha     ON venta (estado, fecha_hora);        -- nuevo
CREATE INDEX idx_detalle_producto       ON detalle_venta (id_producto);
CREATE INDEX idx_prod_categoria         ON producto (id_categoria);
CREATE INDEX idx_prod_nombre            ON producto (nombre);
CREATE INDEX idx_inv_cantidad           ON inventario (cantidad);
CREATE INDEX idx_inventario_cantidad_minimo ON inventario (cantidad, stock_minimo); -- nuevo
CREATE INDEX idx_movimiento_producto_fecha ON movimiento_inventario (id_producto, registrado_en); -- nuevo

-- ============================================================
-- VISTAS PARA REPORTES (RF5)
-- ============================================================

-- Vista: Productos con stock bajo el mínimo
CREATE OR REPLACE VIEW v_stock_bajo AS
SELECT
    p.id_producto,
    p.codigo,
    p.nombre,
    c.nombre            AS categoria,
    p.talla,
    p.color,
    i.cantidad          AS stock_actual,
    i.stock_minimo
FROM inventario i
JOIN producto   p ON p.id_producto = i.id_producto
JOIN categoria  c ON c.id_categoria = p.id_categoria
WHERE i.cantidad < i.stock_minimo
  AND p.activo = 1;

-- Vista: Resumen de ventas por producto (para "más vendidos")
CREATE OR REPLACE VIEW v_ventas_por_producto AS
SELECT
    p.id_producto,
    p.codigo,
    p.nombre,
    c.nombre            AS categoria,
    p.talla,
    p.color,
    SUM(dv.cantidad)    AS unidades_vendidas,
    SUM(dv.subtotal)    AS ingreso_total,
    DATE(v.fecha_hora)  AS fecha_venta
FROM detalle_venta dv
JOIN venta   v  ON v.id_venta   = dv.id_venta
JOIN producto p  ON p.id_producto = dv.id_producto
JOIN categoria c ON c.id_categoria = p.id_categoria
WHERE v.estado = 'COMPLETADA'
GROUP BY p.id_producto, p.codigo, p.nombre, c.nombre,
         p.talla, p.color, DATE(v.fecha_hora);

-- Vista: Historial de ventas detallado
CREATE OR REPLACE VIEW v_historial_ventas AS
SELECT
    v.id_venta,
    v.fecha_hora,
    u.nombre            AS empleado,
    COALESCE(cl.nombre, 'Cliente general') AS cliente,
    p.nombre            AS producto,
    p.talla,
    p.color,
    dv.cantidad,
    dv.precio_unitario,
    dv.subtotal,
    v.total,
    v.metodo_pago,
    v.estado
FROM venta v
JOIN detalle_venta dv ON dv.id_venta    = v.id_venta
JOIN producto      p  ON p.id_producto  = dv.id_producto
JOIN usuario       u  ON u.id_usuario   = v.id_usuario
LEFT JOIN cliente  cl ON cl.id_cliente  = v.id_cliente;

-- ============================================================
-- DATOS INICIALES (seed)
-- ============================================================

INSERT INTO categoria (nombre) VALUES
    ('Dama'),
    ('Caballero'),
    ('Gorras');

INSERT INTO tipo_prenda (nombre) VALUES
    ('Camisa'),
    ('Pantalón'),
    ('Vestido'),
    ('Gorra'),
    ('Blusa'),
    ('Falda'),
    ('Chaqueta'),
    ('Bermuda');

-- Usuario administrador (contraseña: Admin1234! - cambiar en producción)
-- El hash es SHA2('Admin1234!', 256) - para pruebas, pero en producción usa bcrypt
INSERT INTO usuario (nombre, correo, contrasena_hash, rol) VALUES
    ('Deinnys Carreño', 'admin@sietestore.com',
     '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'ADMIN');

-- Usuario empleado genérico (contraseña: Empleado123!)
INSERT INTO usuario (nombre, correo, contrasena_hash, rol) VALUES
    ('Empleado', 'empleado@sietestore.com',
     'f7c3bc1d808e04732adf679965ccc34ca7ae3441e4887c8a5e3f9a8e0b8b6b6e', 'EMPLEADO');