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

// DAWPSS-11 

@PostMapping("/{id}/duplicar")
public Producto duplicarProducto(@PathVariable Long id) {

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

}