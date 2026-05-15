/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.service;
import com.SieteStore.SietestoreInit.model.DetalleVenta;
import com.SieteStore.SietestoreInit.model.Producto;
import com.SieteStore.SietestoreInit.model.Venta;
import com.SieteStore.SietestoreInit.repository.DetalleVentaRepository;
import com.SieteStore.SietestoreInit.repository.ProductoRepository;
import com.SieteStore.SietestoreInit.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
/**
 *
 * @author JEISON
 */
@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Transactional
    public Venta procesarVenta(Venta venta, List<DetalleVenta> detalles) {
        BigDecimal totalVenta = BigDecimal.ZERO;

        // 1. Guardar primero la cabecera de la venta para obtener el ID
        Venta nuevaVenta = ventaRepository.save(venta);

        for (DetalleVenta detalle : detalles) {
            // 2. Validar que el producto existe
            Producto producto = productoRepository.findById(detalle.getProducto().getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detalle.getProducto().getIdProducto()));

            // 3. Validar Stock (Lógica de negocio extra al Trigger para avisar al usuario)
            if (producto.getStockActual() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }

            // 4. Configurar el detalle
            detalle.setVenta(nuevaVenta);
            detalle.setProducto(producto);
            detalle.setPrecioUnitario(producto.getPrecioVenta());
            
            // El subtotal se calcula en la BD por tu columna GENERATED, 
            // pero lo sumamos aquí para el total de la cabecera
            BigDecimal subtotal = producto.getPrecioVenta().multiply(new BigDecimal(detalle.getCantidad()));
            totalVenta = totalVenta.add(subtotal);

            // 5. Guardar detalle (Esto disparará tu Trigger en MySQL para descontar stock)
            detalleVentaRepository.save(detalle);
        }

        // 6. Actualizar el total de la venta
        nuevaVenta.setTotalVenta(totalVenta);
        return ventaRepository.save(nuevaVenta);
    }
}
