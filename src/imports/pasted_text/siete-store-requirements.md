hola! necesito que me hagas un diseño para una pagina web de venta de ropa llamada siete store, te voy a pasar unos parametros para la tienda de ropa "Siete Store", la cual es una pagina web que necesito que realices, lo que quiero es que pueda mostrar sus productos, que permita la venta de estos. a continuacion te describo funcionalidades que necesito que tenga esta pagina web:
6.1	Requisitos Funcionales:
RF1.	Registro de ventas: El sistema debe permitir registrar cada venta de prendas, incluyendo producto, talla, cantidad, precio y método de pago.
RF2.	Gestión de inventario: El sistema debe permitir agregar, modificar y eliminar productos, además de actualizar automáticamente el stock cuando se realiza una venta.
RF3.	Búsqueda de productos: El sistema debe permitir buscar prendas por nombre, categoría, talla, color o código.
RF4.	Generación de comprobantes o recibos: El sistema debe generar e imprimir o enviar un recibo con los detalles de la compra realizada por el cliente.
RF5.	Generación de reportes gerenciales:  El sistema debe permitir al usuario administrador (gerente) visualizar reportes básicos que apoyen la toma de decisiones, incluyendo:
•	Productos más vendidos por categoría y período (semana/mes).
•	Niveles de stock actual y productos con existencia por debajo del mínimo definido.
•	Historial de ventas con filtros por fecha, método de pago y cliente (opcional).
6.2	Requisitos No Funcionales:
RNF 1.  Rendimiento: El sistema debe procesar una venta o consulta de producto en menos de 3 segundos.
RNF  2.  Seguridad. El sistema debe proteger la información de ventas y usuarios mediante contraseñas y control de acceso.
RNF  3.  Disponibilidad: El sistema debe estar disponible al menos el 99% del tiempo durante el horario de atención de la tienda.
RNF  4.  Usabilidad: La interfaz del sistema debe ser fácil de usar, permitiendo que un empleado pueda aprender a utilizarlo en poco tiempo.
6.3	Requisitos de Información
6.3.1	Información de productos
El sistema debe almacenar información detallada de cada prenda.
Datos necesarios:
•	Código o ID del producto
•	Nombre del producto
•	Categoría (Caballero, Dama, Gorra)
•	Tipo de prenda (camisa, pantalón, vestido, gorra, etc.)
•	Talla (S, M, L, XL, etc.)
•	Color
•	Marca
•	Precio de venta
•	Costo del producto
•	Cantidad en inventario
•	Descripción del producto
6.3.2	Información de inventario
Permite controlar la disponibilidad de las prendas.
Datos necesarios:
•	ID del producto
•	Cantidad disponible
•	Cantidad mínima de stock
•	Fecha de ingreso del producto
•	Movimiento de inventario (entrada o salida)
•	Ubicación en la tienda o almacén
6.3.3	Información de clientes
Si la tienda maneja registro de clientes o ventas asociadas.
Datos necesarios:
•	ID del cliente
•	Nombre completo
•	Número de identificación
•	Teléfono
•	Correo electrónico
•	Dirección
6.3.4	Información de ventas
Permite registrar cada venta realizada.
Datos necesarios:
•	ID de la venta
•	Fecha y hora de la venta
•	Productos vendidos
•	Cantidad por producto
•	Precio unitario
•	Total de la venta
•	Método de pago (efectivo, tarjeta, transferencia)
•	Cliente (opcional)
6.3.5	Información de proveedores
Para gestionar el abastecimiento de la ropa.
Datos necesarios:
•	ID del proveedor
•	Nombre de la empresa o persona
•	Teléfono
•	Correo electrónico
•	Dirección
•	Productos que suministra
6.4.1	Reportes específicos que implementar
Para garantizar que la administradora (Deinnys) pueda tomar decisiones basadas en datos reales, la plataforma incluirá los siguientes reportes, todos accesibles desde un panel de administración:
      - Reporte de productos más vendidos
•	Descripción: Muestra los productos con mayor cantidad de unidades vendidas en un período seleccionado.
•	Campos: Nombre del producto, categoría (dama/caballero/gorra), talla, color, cantidad vendida.
•	Filtros: Por período (últimos 7 días, últimos 30 días, rango personalizado) y por categoría.
-	Reporte de stock bajo (alerta de inventario)
•	Descripción: Lista los productos cuya cantidad en inventario está por debajo de un mínimo definido por la administradora (por ejemplo, menos de 5 unidades).
•	Campos: Nombre del producto, talla, color, cantidad actual, mínimo definido.
•	Filtros: Ninguno (se muestra todo lo que esté bajo mínimo).
-	 Reporte de historial de ventas
•	Descripción: Registro detallado de todas las ventas realizadas, útil para auditorías y análisis.
•	Campos: Fecha y hora, productos vendidos (nombre, talla, color), cantidad, precio unitario, total de la venta, método de pago, cliente (si se registró).
•	Filtros: Por rango de fechas, por método de pago, por cliente.

Ahora vienen las vistas que debe tener esta pagina web, que son dos diferentes: para usuarios:cliente y administradores
10.1	1. Diseño de las vistas de los perfiles de usuario y la interaccion
Perfil Administrador: Accede a todas las funcionalidades del sistema: dashboard, ventas, inventario, reportes, usuarios y configuracion. Unicamente el administrador puede crear, modificar y eliminar productos, consultar reportes gerenciales y gestionar credenciales de acceso.
Perfil Empleado: Accede exclusivamente al modulo de registro de ventas y busqueda de productos. Las secciones de inventario, reportes, usuarios y configuracion permanecen bloqueadas para este perfil.
10.1.1	Vista 1 - Pantalla de Inicio de Sesion (Login)
Pantalla comun para ambos perfiles. El usuario ingresa su correo y contrasena, selecciona su perfil de acceso (Administrador o Empleado) y presiona Ingresar. El sistema valida las credenciales y redirige al dashboard correspondiente segun el rol seleccionado (RF: RNF2 - Seguridad).
10.1.2	Vista 2 - Dashboard del Administrador
Panel de control exclusivo del perfil Administrador. Muestra indicadores clave de gestion (KPIs): ventas del mes, numero de ventas del dia, total de productos en stock y productos con nivel critico de inventario. Incluye tabla de ultimas ventas con estado de cada transaccion y panel lateral de alertas de stock bajo. Desde aqui el administrador puede navegar a todos los modulos del sistema (RF5, RNF1).
10.1.3	Vista 3 - Dashboard del Empleado (Registro de Venta)
Vista principal del perfil Empleado. La pantalla esta dividida en dos zonas: a la izquierda el catalogo de productos con buscador y filtros por categoria (Dama, Caballero, Gorras), y a la derecha el panel de venta activa donde se acumulan los productos seleccionados, se visualiza el total y se selecciona el metodo de pago. Las opciones de inventario, reportes y configuracion aparecen bloqueadas en el menu lateral (RF1, RF3, RNF2, RNF4). 
10.1.4	Vista 4 - Modulo de Gestion de Inventario (solo Administrador)
Modulo exclusivo del perfil Administrador para la gestion completa del catalogo de productos. Presenta una tabla con todos los productos registrados, incluyendo referencia, categoria, talla, color, precio y nivel de stock representado mediante una barra de progreso visual. Permite buscar y filtrar por categoria, talla y estado de stock. Cada registro cuenta con botones de edicion, duplicado y eliminacion. Al crear un nuevo producto, se despliega un formulario modal con todos los campos requeridos (RF2, RA-01, RA-07).
10.1.5	Flujo de interaccion entre vistas
El sistema define dos flujos diferenciados segun el perfil autenticado:
Flujo Administrador: Login → Dashboard Admin → [Ventas / Inventario / Reportes / Usuarios / Proveedores / Configuracion]. El administrador navega libremente entre todos los modulos desde el menu lateral persistente.
Flujo Empleado: Login → Vista de Venta → Seleccion de productos → Confirmacion de metodo de pago → Cobro → Generacion de recibo. El empleado no puede acceder a modulos restringidos; cualquier intento redirige al sistema de autenticacion.