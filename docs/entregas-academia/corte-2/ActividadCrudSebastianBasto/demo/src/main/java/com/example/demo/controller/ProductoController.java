
package com.example.demo.controller;

/**
 *
 * @author ASUS
 */

import com.example.demo.model.Producto;
import com.example.demo.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/productos")
public class ProductoController {
   
    @Autowired
    private ProductoService service;

    // GET - LISTAR
    @GetMapping
    public List<Producto> listar() {
        return service.listar();
    }

    // POST - GUARDAR
    @PostMapping
    public Producto guardar(@RequestBody Producto producto) {
        return service.guardar(producto);
    }

    // GET POR ID
    @GetMapping("/{id}")
    public Optional<Producto> buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    // PUT - ACTUALIZAR
    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id,
                               @RequestBody Producto producto) {

        Producto productoActual = service.buscarPorId(id).orElse(null);

        if (productoActual != null) {

            productoActual.setNombre(producto.getNombre());
            productoActual.setPrecio(producto.getPrecio());

            return service.guardar(productoActual);
        }

        return null;
    }
    
    
}
