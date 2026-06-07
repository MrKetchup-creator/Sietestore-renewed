/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.controller;

import com.SieteStore.SietestoreInit.model.ProductoTopProjection;
import com.SieteStore.SietestoreInit.repository.DetalleVentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.SieteStore.SietestoreInit.model.VentaMensualProjection;
import com.SieteStore.SietestoreInit.repository.VentaRepository;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*") 
public class DashboardController {

    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    @GetMapping("/top-productos")
    public ResponseEntity<List<ProductoTopProjection>> obtenerTop5Productos() {
        // Ahora la base de datos responderá con los registros que acabas de insertar
        List<ProductoTopProjection> top5 = detalleVentaRepository.findTopProductos(PageRequest.of(0, 5));
        return ResponseEntity.ok(top5);
    }
    
    @Autowired
    private VentaRepository ventaRepository;

       @GetMapping("/ventas-mensuales")
    public ResponseEntity<List<VentaMensualProjection>> obtenerVentasMensuales() {
            List<VentaMensualProjection> ventas = ventaRepository.obtenerVentasMensuales();

    return ResponseEntity.ok(ventas);
}
}
