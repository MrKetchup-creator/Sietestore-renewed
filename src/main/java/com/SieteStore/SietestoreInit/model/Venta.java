/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.model;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
/**
 *
 * @author JEISON
 */
@Data
@Entity
@Table(name = "ventas")
public class Venta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Long idVenta;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario; // Por ahora lo manejamos como Long para simplificar

    @Column(name = "fecha_hora", insertable = false, updatable = false)
    private LocalDateTime fechaHora;

    @Column(name = "total_venta", nullable = false)
    private BigDecimal totalVenta;

    @Column(name = "metodo_pago", nullable = false)
    private String metodoPago;
}
