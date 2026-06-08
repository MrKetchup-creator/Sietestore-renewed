/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.repository;
import com.SieteStore.SietestoreInit.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.SieteStore.SietestoreInit.model.VentaMensualProjection;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
/**
 *
 * @author JEISON
 */
@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> { // <-- CAMBIADO A Integer para mantener compatibilidad de los datos

    @Query(value = """
        SELECT DATE_FORMAT(fecha_hora, '%Y-%m') AS mes,
            SUM(total_venta) AS total
        FROM ventas
        GROUP BY mes
        ORDER BY mes ASC
        """, nativeQuery = true)
    List<VentaMensualProjection> obtenerVentasMensuales();

}