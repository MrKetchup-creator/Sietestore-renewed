package com.SieteStore.SietestoreInit.repository;

import com.SieteStore.SietestoreInit.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
@Repository
// Cambiamos el segundo parámetro de Long a Integer
public interface ProductoRepository extends JpaRepository<Producto, Integer> { 

    List<Producto> findByActivoTrue();

    @Query("SELECT p FROM Producto p WHERE " +
           "(:idCategoria IS NULL OR p.idCategoria = :idCategoria) AND " +
           "(:talla IS NULL OR p.talla = :talla) AND " +
           "p.activo = true")
    List<Producto> filtrarProductos(
        @Param("idCategoria") Integer idCategoria, // Cambiado de Long a Integer
        @Param("talla") String talla
    );
}