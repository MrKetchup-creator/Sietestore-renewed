/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.dto;
import lombok.Data;
import java.util.List;
/**
 *
 * @author JEISON
 */
@Data
public class VentaRequest {
    private Long idUsuario;
    private String metodoPago;
    private List<DetalleRequest> detalles;

    @Data
    public static class DetalleRequest {
        private Long idProducto;
        private Integer cantidad;
    }
}
