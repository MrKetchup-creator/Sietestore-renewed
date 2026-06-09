package com.SieteStore.SietestoreInit.controller;

import com.SieteStore.SietestoreInit.dto.VentaRequest;
import com.SieteStore.SietestoreInit.model.DetalleVenta;
import com.SieteStore.SietestoreInit.model.Venta;
import com.SieteStore.SietestoreInit.repository.DetalleVentaRepository;
import com.SieteStore.SietestoreInit.repository.VentaRepository;
import com.SieteStore.SietestoreInit.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.SieteStore.SietestoreInit.service.PdfService;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author JEISON
 */
@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaService ventaService;
    
    @Autowired
    private PdfService pdfService;
    
    @Autowired
    private VentaRepository ventaRepository;
    
    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    @PostMapping("/procesar")
    public ResponseEntity<?> procesarVenta(@RequestBody VentaRequest request) {
        try {
            // 1. Convertimos el DTO a Entidad Venta
            Venta venta = new Venta();
            
            // Blindaje técnico: Conversión segura a Integer sin importar el tipo nativo del DTO
            if (request.getIdUsuario() != null) {
                venta.setIdUsuario(request.getIdUsuario().intValue());
            }
            venta.setMetodoPago(request.getMetodoPago());

            // 2. Convertimos la lista de detalles del DTO a Entidades DetalleVenta
            List<DetalleVenta> detalles = request.getDetalles().stream().map(detReq -> {
                DetalleVenta detalle = new DetalleVenta();
                com.SieteStore.SietestoreInit.model.Producto p = new com.SieteStore.SietestoreInit.model.Producto();
                
                // Blindaje técnico: Conversión segura del ID del producto a Integer
                if (detReq.getIdProducto() != null) {
                    p.setIdProducto(detReq.getIdProducto().intValue());
                }
                
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
    
    // Si no tienes el repositorio de ventas inyectado directo, puedes invocarlo o usar tu VentaService.
    // Asumiendo que podemos usar el service para buscar o inyectar temporalmente el repositorio para el PDF:
    @GetMapping("/{id}/recibo")
    public ResponseEntity<byte[]> descargarRecibo(@PathVariable Integer id) {
        // 1. Buscar la venta real por ID
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + id));

        // 2. Buscar los detalles de la venta
        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(id);

        if (detalles.isEmpty()) {
            throw new RuntimeException("La venta con ID " + id + " no tiene detalles asociados");
        }

        // 3. Generar el PDF con datos reales
        byte[] pdfBytes = pdfService.generarReciboVenta(venta, detalles);

        // 4. Estructurar headers HTTP de descarga
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "Recibo_SieteStore_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
    
    @GetMapping("/exportar/csv")
    public ResponseEntity<byte[]> exportarReporteVentasCSV() {
        try {
            // 1. Obtener los datos del sistema
            List<DetalleVenta> detalles = ventaService.obtenerReporteDetalladoVentas();

            // 2. Construir el CSV puro de forma manual (Eficiencia Máxima)
            StringBuilder csv = new StringBuilder();

            // TRUCO MAESTRO: Agregar BOM de UTF-8 para garantizar compatibilidad de tildes en Excel
            csv.append("\uFEFF");

            // Definición de Cabeceras (Separadas por ';')
            csv.append("ID Venta;Fecha y Hora;Método Pago;Producto;Cantidad;Precio Unitario;Subtotal;Total Venta\n");

            // 3. Iterar y rellenar las filas
            for (DetalleVenta d : detalles) {
                String fecha = (d.getVenta().getFechaHora() != null) ? d.getVenta().getFechaHora().toString() : "N/A";
                String productoNombre = (d.getProducto() != null) ? d.getProducto().getNombre() : "Producto no identificado";

                csv.append(d.getVenta().getIdVenta()).append(";")
                   .append(fecha).append(";")
                   .append(d.getVenta().getMetodoPago()).append(";")
                   .append(productoNombre).append(";")
                   .append(d.getCantidad()).append(";")
                   .append(d.getPrecioUnitario()).append(";")
                   .append(d.getSubtotal() != null ? d.getSubtotal() : "0").append(";")
                   .append(d.getVenta().getTotalVenta()).append("\n");
            }

            // 4. Convertir la cadena a arreglo de bytes en formato UTF-8
            byte[] csvBytes = csv.toString().getBytes(StandardCharsets.UTF_8);

            // 5. Estructurar headers HTTP para forzar la descarga nativa del navegador
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
            headers.setContentDispositionFormData("attachment", "Reporte_Ventas_SieteStore.csv");

            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            // En caso de error técnico, retornamos un código 500 protegiendo el flujo
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> obtenerVentas(
            @RequestParam(required = false) Integer limit) {

        List<Object[]> ventas;
        if (limit != null) {
            ventas = ventaRepository.findTopNByOrderByFechaHoraDesc(limit);
        } else {
            ventas = ventaRepository.findAllVentasWithUser();
        }

        List<Map<String, Object>> response = ventas.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id_venta", row[0]);
            map.put("fecha_hora", row[1]);
            map.put("metodo_pago", row[2]);
            map.put("total_venta", row[3]);
            map.put("usuario_nombre", row[4]);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
    
}//fin de clase