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
    
    // SOLUCIÓN: Mapeamos la columna de la BD directamente como un entero largo
    @Column(name = "id_categoria", nullable = false)
    private Long idCategoria = 1L;
    
    // SOLUCIÓN AL NUEVO ERROR: Mapeamos la columna costo con un valor por defecto
    @Column(name = "costo", nullable = false)
    private BigDecimal costo = BigDecimal.ZERO;
    
}