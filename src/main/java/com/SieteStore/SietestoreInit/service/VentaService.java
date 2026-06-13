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

        // 🔥 1. Calcular el total primero (sin guardar la venta aún)
        for (DetalleVenta detalle : detalles) {
            Producto producto = productoRepository.findById(detalle.getProducto().getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detalle.getProducto().getIdProducto()));

            // Validar stock (opcional, el trigger también lo hará)
            if (producto.getStockActual() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }

            BigDecimal subtotal = producto.getPrecioVenta().multiply(new BigDecimal(detalle.getCantidad()));
            totalVenta = totalVenta.add(subtotal);
        }

        // 🔥 2. Asignar el total a la venta antes de guardarla
        venta.setTotalVenta(totalVenta);

        // 3. Guardar la cabecera de la venta (ya con total calculado)
        Venta nuevaVenta = ventaRepository.save(venta);

        // 4. Guardar los detalles (asociados a la venta recién creada)
        for (DetalleVenta detalle : detalles) {
            Producto producto = productoRepository.findById(detalle.getProducto().getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detalle.getProducto().getIdProducto()));

            detalle.setVenta(nuevaVenta);
            detalle.setProducto(producto);
            BigDecimal precioUnitario = producto.getPrecioVenta();
            if (precioUnitario == null || precioUnitario.compareTo(BigDecimal.ZERO) == 0) {
                throw new RuntimeException("El producto " + producto.getNombre() + " no tiene precio de venta válido.");
            }
            detalle.setPrecioUnitario(precioUnitario);
            detalleVentaRepository.save(detalle);
        }
        
        // Después de guardar todos los detalles, verificar productos con stock 0 y desactivarlos
        for (DetalleVenta detalle : detalles) {
            Producto productoActualizado = productoRepository.findById(detalle.getProducto().getIdProducto()).orElse(null);
            if (productoActualizado != null && productoActualizado.getStockActual() == 0 && productoActualizado.getActivo()) {
                productoActualizado.setActivo(false);
                productoRepository.save(productoActualizado);
            }
        }
        
        // Después de guardar los detalles, verificar productos con stock 0 y desactivarlos
        for (DetalleVenta detalle : detalles) {
            // Volvemos a buscar el producto actualizado (el trigger ya descontó stock)
            Producto productoActualizado = productoRepository.findById(detalle.getProducto().getIdProducto()).orElse(null);
            if (productoActualizado != null && productoActualizado.getStockActual() == 0 && productoActualizado.getActivo()) {
                productoActualizado.setActivo(false);
                productoRepository.save(productoActualizado);
                // Opcional: log o mensaje de alerta para el frontend
            }
        }

        // 5. Retornar la venta guardada (ya tiene el total correcto)
        return nuevaVenta;
    }

    public List<DetalleVenta> obtenerReporteDetalladoVentas() {
        return detalleVentaRepository.findAll();
    }
}