package com.SieteStore.SietestoreInit.service;

/**
 * @author JEISON
 */
import com.SieteStore.SietestoreInit.model.Venta;
import com.SieteStore.SietestoreInit.model.DetalleVenta;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.awt.Color;
import java.util.List;


@Service
public class PdfService {

    public byte[] generarReciboVenta(Venta venta, List<DetalleVenta> detalles) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A6, 20, 20, 20, 20);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // --- Configuración de Fuentes ---
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.BLACK);
            Font fontSubtitulo = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
            Font fontTexto = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font fontNegrita = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);

            // --- Encabezado de la Tienda ---
            Paragraph titulo = new Paragraph("SIETESTORE", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);

            Paragraph eslogan = new Paragraph("Moda y Estilo Urbano\nNIT: 123456789-1\nCalle 7 # 77-77", fontSubtitulo);
            eslogan.setAlignment(Element.ALIGN_CENTER);
            eslogan.setSpacingAfter(10);
            document.add(eslogan);

            // Línea divisoria
            Paragraph linea = new Paragraph("----------------------------------------------------------------", fontSubtitulo);
            document.add(linea);

            // --- Metadatos de la Venta ---
            document.add(new Paragraph("Recibo No: RE-" + (venta.getIdVenta() != null ? venta.getIdVenta() : "TEMP"), fontNegrita));
            document.add(new Paragraph("Cajero ID: " + venta.getIdUsuario(), fontTexto));
            document.add(new Paragraph("Método de Pago: " + venta.getMetodoPago(), fontTexto));
            document.add(linea);

            // --- Tabla de Productos ---
            PdfPTable tabla = new PdfPTable(4);
            tabla.setWidthPercentage(100);
            tabla.setWidths(new float[]{4f, 1.5f, 2f, 2.5f});
            tabla.setSpacingBefore(5);

            // 🔥 DECLARACIÓN DE LA VARIABLE totalAcumulado AQUÍ
            double totalAcumulado = 0.0;

            // Renderizar los detalles dinámicamente
            for (DetalleVenta det : detalles) {
                String prodNombre = (det.getProducto() != null && det.getProducto().getNombre() != null) 
                        ? det.getProducto().getNombre() : "Producto #" + det.getProducto().getIdProducto();

                double precioUnitario = det.getPrecioUnitario().doubleValue();
                double subtotal = det.getCantidad() * precioUnitario;
                totalAcumulado += subtotal;

                tabla.addCell(new PdfPCell(new Paragraph(prodNombre, fontTexto))).setBorder(Rectangle.NO_BORDER);

                PdfPCell cCant = new PdfPCell(new Paragraph(String.valueOf(det.getCantidad()), fontTexto));
                cCant.setHorizontalAlignment(Element.ALIGN_CENTER);
                cCant.setBorder(Rectangle.NO_BORDER);
                tabla.addCell(cCant);

                PdfPCell cPrecio = new PdfPCell(new Paragraph("$" + precioUnitario, fontTexto));
                cPrecio.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cPrecio.setBorder(Rectangle.NO_BORDER);
                tabla.addCell(cPrecio);

                PdfPCell cSub = new PdfPCell(new Paragraph("$" + subtotal, fontTexto));
                cSub.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cSub.setBorder(Rectangle.NO_BORDER);
                tabla.addCell(cSub);
            }

            document.add(tabla);
            document.add(linea);

            // --- Cierre y Totales ---
            Paragraph totalBlock = new Paragraph("TOTAL PAGADO: $" + totalAcumulado, fontTitulo);
            totalBlock.setAlignment(Element.ALIGN_RIGHT);
            document.add(totalBlock);

            Paragraph pie = new Paragraph("\n¡Gracias por tu compra en SieteStore!\nConserva este recibo para cambios.", fontSubtitulo);
            pie.setAlignment(Element.ALIGN_CENTER);
            document.add(pie);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error fatal construyendo la estructura gráfica del PDF", e);
        }

        return out.toByteArray();
    }
}
