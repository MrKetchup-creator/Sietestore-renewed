package com.SieteStore.SietestoreInit.controller;

import com.SieteStore.SietestoreInit.model.DetalleVenta;
import com.SieteStore.SietestoreInit.model.ProductoTopProjection;
import com.SieteStore.SietestoreInit.repository.DetalleVentaRepository;
import com.SieteStore.SietestoreInit.repository.ProductoRepository;
import com.SieteStore.SietestoreInit.repository.VentaRepository;
import com.SieteStore.SietestoreInit.service.VentaService;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private DetalleVentaRepository detalleVentaRepository;
    
    @Autowired
    private VentaService ventaService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();

        // Ventas del mes
        BigDecimal ventasMes = ventaRepository.obtenerVentasDelMes();
        stats.put("ventasMes", ventasMes != null ? ventasMes : BigDecimal.ZERO);

        // Ventas de hoy
        BigDecimal ventasHoy = ventaRepository.obtenerVentasDeHoy();
        stats.put("ventasHoy", ventasHoy != null ? ventasHoy : BigDecimal.ZERO);

        // Stock total
        Integer stockTotal = productoRepository.obtenerStockTotal();
        stats.put("stockTotal", stockTotal != null ? stockTotal : 0);

        // Stock crítico
        Integer stockCritico = productoRepository.obtenerStockCritico();
        stats.put("stockCritico", stockCritico != null ? stockCritico : 0);

        // Datos para el gráfico (últimos 7 días)
        List<Object[]> ventasPorDia = ventaRepository.obtenerVentasPorDiaUltimos7Dias();
        stats.put("ventasPorDia", ventasPorDia);

        // Últimas 5 ventas para la tabla del dashboard
        List<Object[]> ultimasVentas = ventaRepository.findTop5ByOrderByFechaHoraDesc(); // Necesitas crear este método
        stats.put("ultimasVentas", ultimasVentas);

        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/dashboard/top-productos")
    public ResponseEntity<List<ProductoTopProjection>> obtenerTop5Productos(
            @RequestParam(required = false) Integer categoryId) { // Recibir el parámetro
        List<ProductoTopProjection> top5 = detalleVentaRepository.findTopProductos(categoryId, PageRequest.of(0, 5));
        return ResponseEntity.ok(top5);
    }
    
    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportarReporte(
            @RequestParam String type,
            @RequestParam(required = false) Integer categoryId) throws IOException {

        byte[] fileBytes;
        String fileName;
        String contentType;

        // Top Productos
        if ("top".equals(type)) {
            List<ProductoTopProjection> productos = detalleVentaRepository.findTopProductos(categoryId, PageRequest.of(0, 20));
            StringBuilder csv = new StringBuilder();
            csv.append("\uFEFF"); // BOM
            csv.append("Producto;Unidades Vendidas\n");
            productos.forEach(p -> csv.append(p.getNombre()).append(";").append(p.getTotalVendido()).append("\n"));
            fileBytes = csv.toString().getBytes(StandardCharsets.UTF_8);
            fileName = "top_productos.csv";
            contentType = "text/csv; charset=UTF-8";
        } 
        // Historial
        else if ("history".equals(type)) {
            List<DetalleVenta> detalles = ventaService.obtenerReporteDetalladoVentas();
            StringBuilder csv = new StringBuilder();
            csv.append("\uFEFF");
            csv.append("ID Venta;Fecha/Hora;Método Pago;Producto;Cantidad;Precio Unitario;Total Venta\n");
            for (DetalleVenta d : detalles) {
                String fecha = d.getVenta().getFechaHora() != null 
                        ? d.getVenta().getFechaHora().toString().replace("T", " ") : "N/A";
                String metodo = d.getVenta().getMetodoPago() != null ? d.getVenta().getMetodoPago() : "N/A";
                String nombre = d.getProducto() != null ? d.getProducto().getNombre() : "Producto desconocido";
                double precio = d.getPrecioUnitario() != null ? d.getPrecioUnitario().doubleValue() : 0.0;
                double subtotal = d.getSubtotal() != null ? d.getSubtotal().doubleValue() : 0.0;
                double total = d.getVenta().getTotalVenta() != null ? d.getVenta().getTotalVenta().doubleValue() : 0.0;

                csv.append(d.getVenta().getIdVenta()).append(";")
                   .append(fecha).append(";")
                   .append(metodo).append(";")
                   .append(nombre).append(";")
                   .append(d.getCantidad()).append(";")
                   .append(String.format("%.2f", precio)).append(";")
                    .append(String.format("%.2f", total)).append("\n");
            }
            fileBytes = csv.toString().getBytes(StandardCharsets.UTF_8);
            fileName = "historial_ventas.csv";
            contentType = "text/csv; charset=UTF-8";
        } else {
            return ResponseEntity.badRequest().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDispositionFormData("attachment", fileName);

        return ResponseEntity.ok().headers(headers).body(fileBytes);
    }
}//fin de la clase