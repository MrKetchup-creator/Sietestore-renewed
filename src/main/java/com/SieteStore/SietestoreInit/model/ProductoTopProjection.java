/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.model;

/**
 * @author JEISON
 */
public interface ProductoTopProjection {
    Integer getIdProducto();
    String getNombre();
    Long getTotalVendido(); // La suma de cantidades en JPQL retorna Long por defecto
}
