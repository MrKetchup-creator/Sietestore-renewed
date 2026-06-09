package com.SieteStore.SietestoreInit.controller;

import com.SieteStore.SietestoreInit.model.Producto;
import com.SieteStore.SietestoreInit.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.SieteStore.SietestoreInit.repository.ProductoRepository;
import com.SieteStore.SietestoreInit.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    
    @Autowired
    private UsuarioRepository usuarioRepository;

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
    
    
    
    
    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> listarTodos() {
        return productoRepository.findByActivoTrue();
    }
    
    @GetMapping("/filtrar")
    public List<Producto> filtrar(
            @RequestParam(required = false) Integer idCategoria, // CAMBIADO: Long -> Integer (DAWPSS-10)
            @RequestParam(required = false) String talla) {
        
        return productoRepository.filtrarProductos(idCategoria, talla);
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Producto producto, 
                                     @RequestHeader(value = "X-User-Id", required = false) Integer userIdHeader) {
        try {
            validarAccesoAdmin(userIdHeader);
            return ResponseEntity.ok(productoRepository.save(producto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void eliminar(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Id", required = false) Integer userIdHeader) {

        // Ejecutar control de rol antes de procesar
        validarAccesoAdmin(userIdHeader);

        productoRepository.findById(id).ifPresent(p -> {
            p.setActivo(false);
            productoRepository.save(p);
        });
    }

    @PutMapping("/{id}/stock")
    public Producto actualizarStock(
            @PathVariable Integer id, // CAMBIADO: Long -> Integer
            @RequestParam Integer cantidad) {

        if (cantidad <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setStockActual(producto.getStockActual() + cantidad);

        return productoRepository.save(producto);
    }

    @PutMapping("/{id}/descontar-stock")
    public Producto descontarStock( // Boton que descuenta el inventario
            @PathVariable Integer id, // CAMBIADO: Long -> Integer
            @RequestParam Integer cantidad) {

        if (cantidad <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getStockActual() < cantidad) {
            throw new RuntimeException("Stock insuficiente");
        }

        producto.setStockActual(producto.getStockActual() - cantidad);

        return productoRepository.save(producto);
    }



// DAWPSS-11 

@PostMapping("/{id}/duplicar")
public Producto duplicarProducto(@PathVariable Integer id) {

    Producto original = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

    Producto copia = new Producto();

    String nuevoCodigo = original.getCodigoReferencia()
            + "-COPY-" + System.currentTimeMillis();

    copia.setCodigoReferencia(nuevoCodigo);
    copia.setNombre(original.getNombre());
    copia.setTalla(original.getTalla());
    copia.setColor(original.getColor());
    copia.setPrecioVenta(original.getPrecioVenta());
    copia.setStockActual(original.getStockActual());
    copia.setStockMinimo(original.getStockMinimo());
    copia.setActivo(original.getActivo());

    return productoRepository.save(copia);
}


@GetMapping("/low-stock")
public ResponseEntity<List<Producto>> obtenerProductosBajoStock(
        @RequestParam(defaultValue = "3") Integer threshold) {
    List<Producto> productos = productoRepository.findByActivoTrueAndStockActualLessThanEqual(threshold);
    return ResponseEntity.ok(productos);
}

}