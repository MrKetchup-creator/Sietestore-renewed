package com.SieteStore.SietestoreInit.controller;

import com.SieteStore.SietestoreInit.model.Producto;
import com.SieteStore.SietestoreInit.model.Usuario;
import com.SieteStore.SietestoreInit.repository.CategoriaRepository;
import com.SieteStore.SietestoreInit.repository.ProductoRepository;
import com.SieteStore.SietestoreInit.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository; // Necesitarás crear este repositorio (o validar sin él)

    // Método auxiliar de control de acceso por software (RA-03)
    private void validarAccesoAdmin(Integer idUsuarioContexto) {
        if (idUsuarioContexto == null) {
            throw new RuntimeException("Acceso denegado: No se proporcionó identidad de usuario (X-User-Id faltante).");
        }
        Usuario usuario = usuarioRepository.findById(idUsuarioContexto)
                .orElseThrow(() -> new RuntimeException("Acceso denegado: El usuario no existe."));
        if (!"ADMINISTRADOR".equalsIgnoreCase(usuario.getRol())) {
            throw new RuntimeException("Acceso denegado: El rol 'EMPLEADO' no tiene permisos para modificar el catálogo.");
        }
    }

    // ================== LISTAR PRODUCTOS (con opción de incluir inactivos) ==================
    @GetMapping
    public List<Producto> listarProductos(@RequestParam(required = false) Boolean incluirInactivos) {
        if (incluirInactivos != null && incluirInactivos) {
            return productoRepository.findAll(); // todos (activos e inactivos)
        } else {
            return productoRepository.findByActivoTrue();
        }
    }

    // ================== FILTRAR PRODUCTOS (mantiene solo activos, no se cambia) ==================
    @GetMapping("/filtrar")
    public List<Producto> filtrar(
            @RequestParam(required = false) Integer idCategoria,
            @RequestParam(required = false) String talla) {
        return productoRepository.filtrarProductos(idCategoria, talla);
    }

    // ================== CREAR PRODUCTO ==================
    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Producto producto,
                                     @RequestHeader(value = "X-User-Id", required = false) Integer userIdHeader) {
        try {
            validarAccesoAdmin(userIdHeader);
            // Validar que la categoría exista (opcional)
            if (producto.getIdCategoria() != null && categoriaRepository != null) {
                if (!categoriaRepository.existsById(producto.getIdCategoria())) {
                    return ResponseEntity.badRequest().body("La categoría especificada no existe.");
                }
            }
            return ResponseEntity.ok(productoRepository.save(producto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ================== EDITAR PRODUCTO (UPDATE COMPLETO) ==================
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(
            @PathVariable Integer id,
            @RequestBody Producto productoActualizado,
            @RequestHeader(value = "X-User-Id", required = false) Integer userIdHeader) {
        try {
            validarAccesoAdmin(userIdHeader);

            Producto productoExistente = productoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));

            // Validar que la nueva categoría exista
            if (productoActualizado.getIdCategoria() != null && categoriaRepository != null) {
                if (!categoriaRepository.existsById(productoActualizado.getIdCategoria())) {
                    return ResponseEntity.badRequest().body("La categoría especificada no existe.");
                }
            }

            // Actualizar campos permitidos (no se puede cambiar el código de referencia ni el id)
            productoExistente.setNombre(productoActualizado.getNombre());
            productoExistente.setIdCategoria(productoActualizado.getIdCategoria());
            productoExistente.setTalla(productoActualizado.getTalla());
            productoExistente.setColor(productoActualizado.getColor());
            productoExistente.setPrecioVenta(productoActualizado.getPrecioVenta());
            productoExistente.setCosto(productoActualizado.getCosto());
            productoExistente.setStockActual(productoActualizado.getStockActual());
            productoExistente.setStockMinimo(productoActualizado.getStockMinimo());
            productoExistente.setActivo(productoActualizado.getActivo());

            return ResponseEntity.ok(productoRepository.save(productoExistente));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ================== REACTIVAR PRODUCTO (SOFT DELETE REVERT) ==================
    @PutMapping("/{id}/reactivar")
    public ResponseEntity<?> reactivarProducto(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Id", required = false) Integer userIdHeader) {
        try {
            validarAccesoAdmin(userIdHeader);

            Producto producto = productoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));

            if (producto.getActivo()) {
                return ResponseEntity.badRequest().body("El producto ya está activo.");
            }

            // Validar que la categoría esté activa (si implementas ese campo)
            // Por ahora solo reactivamos
            producto.setActivo(true);
            return ResponseEntity.ok(productoRepository.save(producto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ================== SOFT DELETE (DESACTIVAR) ==================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Id", required = false) Integer userIdHeader) {
        try {
            validarAccesoAdmin(userIdHeader);
            Producto producto = productoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            if (!producto.getActivo()) {
                return ResponseEntity.badRequest().body("El producto ya está inactivo.");
            }
            producto.setActivo(false);
            productoRepository.save(producto);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ================== ACTUALIZAR STOCK ==================
    @PutMapping("/{id}/stock")
    public Producto actualizarStock(@PathVariable Integer id, @RequestParam Integer cantidad) {
        if (cantidad <= 0) throw new RuntimeException("La cantidad debe ser mayor a 0");
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setStockActual(producto.getStockActual() + cantidad);
        return productoRepository.save(producto);
    }

    @PutMapping("/{id}/descontar-stock")
    public Producto descontarStock(@PathVariable Integer id, @RequestParam Integer cantidad) {
        if (cantidad <= 0) throw new RuntimeException("La cantidad debe ser mayor a 0");
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        if (producto.getStockActual() < cantidad) throw new RuntimeException("Stock insuficiente");
        producto.setStockActual(producto.getStockActual() - cantidad);
        return productoRepository.save(producto);
    }

    // ================== DUPLICAR PRODUCTO (ahora activo por defecto) ==================
    @PostMapping("/{id}/duplicar")
    public Producto duplicarProducto(@PathVariable Integer id) {
        Producto original = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Producto copia = new Producto();
        String nuevoCodigo = original.getCodigoReferencia() + "-COPY-" + System.currentTimeMillis();
        copia.setCodigoReferencia(nuevoCodigo);
        copia.setNombre(original.getNombre());
        copia.setIdCategoria(original.getIdCategoria());
        copia.setTalla(original.getTalla());
        copia.setColor(original.getColor());
        copia.setPrecioVenta(original.getPrecioVenta());
        copia.setCosto(original.getCosto());
        copia.setStockActual(original.getStockActual());
        copia.setStockMinimo(original.getStockMinimo());
        copia.setActivo(true); // 🔥 El duplicado siempre se crea activo

        return productoRepository.save(copia);
    }

    // ================== PRODUCTOS CON STOCK BAJO (solo activos) ==================
    @GetMapping("/low-stock")
    public ResponseEntity<List<Producto>> obtenerProductosBajoStock(@RequestParam(defaultValue = "3") Integer threshold) {
        List<Producto> productos = productoRepository.findByActivoTrueAndStockActualLessThanEqual(threshold);
        return ResponseEntity.ok(productos);
    }
    
    //endpoint filtro id
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Integer id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));
        return ResponseEntity.ok(producto);
    }
}