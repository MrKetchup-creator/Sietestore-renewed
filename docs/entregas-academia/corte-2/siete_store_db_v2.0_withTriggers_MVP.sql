-- Autores: Equipo de Desarrollo DOP (Sebastián, Jeison, Camilo)

-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS siete_store_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE siete_store_db;

-- 2. TABLAS DEL SISTEMA

-- Tabla de Usuarios (Cumple con RI-3 y RNF-2)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Preparado para BCrypt desde Spring Boot
    rol ENUM('ADMINISTRADOR', 'EMPLEADO') NOT NULL DEFAULT 'EMPLEADO',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías (Derivada del diseño de interfaz y taxonomía)
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE, -- Ej: Dama, Caballero, Gorras, Básicos
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabla de Productos (Cumple con RI-1, sin tabla de proveedores)
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    codigo_referencia VARCHAR(50) NOT NULL UNIQUE, -- Ej: JD-001
    nombre VARCHAR(150) NOT NULL,
    id_categoria INT NOT NULL,
    talla VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL CHECK (precio_venta >= 0),
    costo DECIMAL(10,2) NOT NULL CHECK (costo >= 0),
    stock_actual INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INT NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE RESTRICT
);

-- Tabla de Ventas / Transacciones (Cumple con RI-2 y RF-1)
CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL, -- El empleado que registró la venta
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia') NOT NULL,
    CONSTRAINT fk_venta_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
);

-- Tabla Detalle de Venta (Conecta RF-1 y asegura el cálculo del subtotal)
CREATE TABLE detalle_venta (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    -- Columna calculada automáticamente para consistencia de datos
    subtotal DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    CONSTRAINT fk_detalle_venta FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT
);

-- 3. TRIGGERS (Lógica de Negocio en Base de Datos)

DELIMITER //

-- Trigger para descontar stock automáticamente tras registrar un detalle de venta (Cumple RA-01)
CREATE TRIGGER trg_descontar_stock 
AFTER INSERT ON detalle_venta
FOR EACH ROW
BEGIN
    DECLARE stock_disponible INT;
    
    -- Obtener el stock actual del producto
    SELECT stock_actual INTO stock_disponible FROM productos WHERE id_producto = NEW.id_producto;
    
    -- Validar si hay suficiente stock (prevención a nivel de base de datos)
    IF stock_disponible < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Stock insuficiente para realizar la venta de este producto.';
    ELSE
        -- Actualizar el stock
        UPDATE productos 
        SET stock_actual = stock_actual - NEW.cantidad 
        WHERE id_producto = NEW.id_producto;
    END IF;
END //

DELIMITER ;

-- 4. VISTAS PARA REPORTES GERENCIALES (Cumple RF-5, RA-02 y RA-04)

-- Vista 1: Alerta de Stock Crítico (Para el Dashboard del Admin)
CREATE VIEW v_alertas_stock AS
SELECT 
    p.codigo_referencia AS SKU,
    p.nombre AS Producto,
    c.nombre AS Categoria,
    p.talla AS Talla,
    p.color AS Color,
    p.stock_actual AS Stock_Actual,
    p.stock_minimo AS Stock_Minimo,
    CASE 
        WHEN p.stock_actual = 0 THEN 'Agotado'
        WHEN p.stock_actual <= p.stock_minimo THEN 'Crítico'
        ELSE 'Normal'
    END AS Estado_Stock
FROM productos p
JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.stock_actual <= p.stock_minimo AND p.activo = 1;

-- Vista 2: Top Productos Más Vendidos (Para el Reporte de Ventas)
CREATE VIEW v_top_ventas AS
SELECT 
    p.codigo_referencia AS SKU,
    p.nombre AS Producto,
    c.nombre AS Categoria,
    SUM(dv.cantidad) AS Cantidad_Vendida,
    SUM(dv.subtotal) AS Total_Ingresos
FROM detalle_venta dv
JOIN productos p ON dv.id_producto = p.id_producto
JOIN categorias c ON p.id_categoria = c.id_categoria
JOIN ventas v ON dv.id_venta = v.id_venta
GROUP BY p.id_producto, p.codigo_referencia, p.nombre, c.nombre
ORDER BY Cantidad_Vendida DESC;

-- 5. DATOS DE PRUEBA INICIALES (SEED DATA)

-- Inserción de Categorías
INSERT INTO categorias (nombre) VALUES ('Dama'), ('Caballero'), ('Gorras');

-- Inserción de Usuarios (Las contraseñas deben ser reemplazadas por BCrypt desde el backend)
INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES 
('Deinnys Carreño', 'admin@sietestore.com', '$2a$10$X7...', 'ADMINISTRADOR'),
('Juan Pérez', 'juan@sietestore.com', '$2a$10$Y8...', 'EMPLEADO');

-- Inserción de Productos de Prueba (Basados en el mockup visual)
INSERT INTO productos (codigo_referencia, nombre, id_categoria, talla, color, precio_venta, costo, stock_actual, stock_minimo) VALUES 
('JD-001', 'Jeans Skinny Dama', 1, 'M', 'Azul', 65000.00, 30000.00, 12, 5),
('VD-012', 'Vestido Casual Floral', 1, 'S', 'Multicolor', 85000.00, 45000.00, 7, 3),
('CC-005', 'Camisa Oxford Blanca', 2, 'L', 'Blanco', 55000.00, 25000.00, 2, 5), -- Este aparecerá en v_alertas_stock
('GN-003', 'Gorra New Era Negra', 3, 'Única', 'Negro', 35000.00, 15000.00, 18, 5);