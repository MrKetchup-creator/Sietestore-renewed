package com.SieteStore.SietestoreInit.repository;

import com.SieteStore.SietestoreInit.model.DetalleVenta;
import com.SieteStore.SietestoreInit.model.ProductoTopProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {

    @Query(value = "SELECT * FROM detalle_venta WHERE id_venta = :idVenta", nativeQuery = true)
    List<DetalleVenta> findByVentaId(@Param("idVenta") Integer idVenta);

    @Query("SELECT d.producto.idProducto AS idProducto, p.nombre AS nombre, SUM(d.cantidad) AS totalVendido " +
       "FROM DetalleVenta d JOIN d.producto p " +
       "WHERE (:categoryId IS NULL OR p.idCategoria = :categoryId) " +
       "GROUP BY d.producto.idProducto, p.nombre " +
       "ORDER BY SUM(d.cantidad) DESC")
    List<ProductoTopProjection> findTopProductos(@Param("categoryId") Integer categoryId, Pageable pageable);
}
