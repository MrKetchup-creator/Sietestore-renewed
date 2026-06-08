/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.repository;
import com.SieteStore.SietestoreInit.model.DetalleVenta;
import com.SieteStore.SietestoreInit.model.ProductoTopProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
/**
 *
 * @author JEISON
 */
@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {

    @Query("SELECT d.producto.idProducto AS idProducto, p.nombre AS nombre, SUM(d.cantidad) AS totalVendido " +
           "FROM DetalleVenta d JOIN d.producto p " +
           "GROUP BY d.producto.idProducto, p.nombre " +
           "ORDER BY SUM(d.cantidad) DESC")
    List<ProductoTopProjection> findTopProductos(Pageable pageable);
}
