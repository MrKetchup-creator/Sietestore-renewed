package com.SieteStore.SietestoreInit.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data // Genera getters, setters, toString, etc.
@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProducto;

    @Column(unique = true, nullable = false)
    private String codigoReferencia;

    @Column(nullable = false)
    private String nombre;

    private String talla;
    private String color;

    @Column(nullable = false)
    private BigDecimal precioVenta;

    @Column(nullable = false)
    private Integer stockActual;
    
    private Integer stockMinimo;
    private Boolean activo = true;
}