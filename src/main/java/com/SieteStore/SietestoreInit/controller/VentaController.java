package com.SieteStore.SietestoreInit.controller;

import com.SieteStore.SietestoreInit.dto.VentaRequest;
import com.SieteStore.SietestoreInit.model.DetalleVenta;
import com.SieteStore.SietestoreInit.model.Venta;
import com.SieteStore.SietestoreInit.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.SieteStore.SietestoreInit.service.PdfService;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;

import java.util.List;
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
        
        // 1. Simulación/Búsqueda de la entidad de la venta desde el sistema
        // Para asegurar compilación rápida, armamos el cascarón de datos que alimentará al generador:
        Venta ventaMock = new Venta();
        ventaMock.setIdVenta(id);
        ventaMock.setIdUsuario(1); // Admin por defecto para la prueba
        ventaMock.setMetodoPago("EFECTIVO");

        // Buscaremos simular un detalle de venta para validar que rinda la tabla
        DetalleVenta detalleMock = new DetalleVenta();
        com.SieteStore.SietestoreInit.model.Producto pMock = new com.SieteStore.SietestoreInit.model.Producto();
        pMock.setIdProducto(10);
        pMock.setNombre("Camiseta Oversize Negra");
        detalleMock.setProducto(pMock);
        detalleMock.setCantidad(2);

        List<DetalleVenta> detallesMock = List.of(detalleMock);

        // 2. Ejecutar generación binaria del archivo
        byte[] pdfBytes = pdfService.generarReciboVenta(ventaMock, detallesMock);

        // 3. Estructurar headers HTTP de descarga nativa
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
    
    
}