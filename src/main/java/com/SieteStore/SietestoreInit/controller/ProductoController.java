package com.SieteStore.SietestoreInit.controller;

import com.SieteStore.SietestoreInit.model.Producto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.SieteStore.SietestoreInit.repository.ProductoRepository;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*") // Permite conexión con el futuro Frontend
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> listarTodos() {
        return productoRepository.findByActivoTrue();
    }

    @PostMapping
    public Producto guardar(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }
    
    // 1. Obtener un producto por ID (Soluciona el GET /api/productos/2)
    @GetMapping("/{id}")
    public Producto buscarPorId(@PathVariable Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    // 2. Actualizar un producto completo (Soluciona el PUT /api/productos/2)
    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @RequestBody Producto productoDetalle) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        
        // Actualizamos los campos necesarios
        producto.setNombre(productoDetalle.getNombre());
        producto.setCodigoReferencia(productoDetalle.getCodigoReferencia());
        producto.setPrecioVenta(productoDetalle.getPrecioVenta());
        producto.setStockActual(productoDetalle.getStockActual());
        producto.setStockMinimo(productoDetalle.getStockMinimo());
        producto.setTalla(productoDetalle.getTalla());
        producto.setColor(productoDetalle.getColor());
        
        return productoRepository.save(producto);
    }
    
    
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        // Hacemos un borrado lógico para no perder datos históricos
        productoRepository.findById(id).ifPresent(p -> {
            p.setActivo(false);
            productoRepository.save(p);
        });
    }
    @PutMapping("/{id}/stock")
public Producto actualizarStock(
        @PathVariable Long id,
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
public Producto descontarStock( //Boton que descuenta el inventario
        @PathVariable Long id,
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

// 1. DESHACER SOFT DELETE: Activar un producto directamente desde Talend
    @PutMapping("/{id}/activar")
    public Producto activarProducto(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        
        producto.setActivo(true); // Restauramos el estado lógico a 1
        return productoRepository.save(producto);
    }

    // 2. BORRADO FÍSICO (HARD DELETE): Eliminar por completo registros corruptos o nulos
    @DeleteMapping("/{id}/fisico")
    public void eliminarFisico(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("El registro no existe con ID: " + id);
        }
        productoRepository.deleteById(id); // Borrado permanente en MySQL
    }
    
    // 3. PURGA AUTOMÁTICA: Detecta y elimina cualquier registro corrupto (sin nombre)
    @DeleteMapping("/purgar-corruptos")
    public String purgarRegistrosCorruptos() {
        // Buscamos absolutamente todo lo que esté en la tabla
        List<Producto> todos = productoRepository.findAll();
        
        // Filtramos y borramos físicamente los que tengan el campo nombre en null
        long eliminados = todos.stream()
                .filter(p -> p.getNombre() == null)
                .peek(p -> productoRepository.delete(p))
                .count();
                
        return "Mantenimiento completado. Se purgaron " + eliminados + " registros corruptos de la base de datos.";
    }
    
}