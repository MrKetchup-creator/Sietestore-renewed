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
}