/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.controller;
import com.SieteStore.SietestoreInit.dto.VentaRequest;
import com.SieteStore.SietestoreInit.model.DetalleVenta;
import com.SieteStore.SietestoreInit.model.Venta;
import com.SieteStore.SietestoreInit.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
/**
 *
 * @author JEISON
 */
@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @PostMapping("/procesar")
    public ResponseEntity<?> procesarVenta(@RequestBody VentaRequest request) {
        try {
            // 1. Convertimos el DTO a Entidad Venta
            Venta venta = new Venta();
            venta.setIdUsuario(request.getIdUsuario());
            venta.setMetodoPago(request.getMetodoPago());

            // 2. Convertimos la lista de detalles del DTO a Entidades DetalleVenta
            List<DetalleVenta> detalles = request.getDetalles().stream().map(detReq -> {
                DetalleVenta detalle = new DetalleVenta();
                com.SieteStore.SietestoreInit.model.Producto p = new com.SieteStore.SietestoreInit.model.Producto();
                p.setIdProducto(detReq.getIdProducto());
                detalle.setProducto(p);
                detalle.setCantidad(detReq.getCantidad());
                return detalle;
            }).collect(Collectors.toList());

            // 3. Llamamos al servicio transaccional
            Venta resultado = ventaService.procesarVenta(venta, detalles);
            
            return ResponseEntity.ok(resultado);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
