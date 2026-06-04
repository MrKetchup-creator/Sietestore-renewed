package com.SieteStore.SietestoreInit.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
/**
 *
 * @author JEISON
 */
@Data // Genera getters, setters, toString, etc.
@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProducto; // Cambiado de Long a Integer
    
    @Column(name = "id_categoria", nullable = false)
    private Integer idCategoria = 1; // Cambiado de Long a Integer
    
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