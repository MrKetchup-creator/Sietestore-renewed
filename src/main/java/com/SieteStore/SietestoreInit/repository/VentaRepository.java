package com.SieteStore.SietestoreInit.repository;
import com.SieteStore.SietestoreInit.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.SieteStore.SietestoreInit.model.VentaMensualProjection;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import org.springframework.data.repository.query.Param;
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
    
    @Query(value = "SELECT SUM(total_venta) FROM ventas WHERE DATE_FORMAT(fecha_hora, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')", nativeQuery = true)
    BigDecimal obtenerVentasDelMes();

    @Query(value = "SELECT SUM(total_venta) FROM ventas WHERE DATE(fecha_hora) = CURDATE()", nativeQuery = true)
    BigDecimal obtenerVentasDeHoy();

    @Query(value = "SELECT COUNT(*) FROM ventas WHERE DATE(fecha_hora) = CURDATE()", nativeQuery = true)
    Integer obtenerCantidadVentasHoy();

    @Query(value = "SELECT SUM(total_venta) FROM ventas WHERE fecha_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)", nativeQuery = true)
    BigDecimal obtenerVentasUltimos7Dias();

    @Query(value = """
        SELECT DATE(fecha_hora) as fecha, SUM(total_venta) as total
        FROM ventas
        WHERE fecha_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(fecha_hora)
        ORDER BY fecha ASC
    """, nativeQuery = true)
    List<Object[]> obtenerVentasPorDiaUltimos7Dias();
    
    @Query(value = "SELECT v.id_venta, v.fecha_hora, v.metodo_pago, v.total_venta, u.nombre FROM ventas v JOIN usuarios u ON v.id_usuario = u.id_usuario ORDER BY v.fecha_hora DESC LIMIT 5", nativeQuery = true)
    List<Object[]> findTop5ByOrderByFechaHoraDesc();
    
    @Query(value = "SELECT v.id_venta, v.fecha_hora, v.metodo_pago, v.total_venta, u.nombre FROM ventas v JOIN usuarios u ON v.id_usuario = u.id_usuario ORDER BY v.fecha_hora DESC LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopNByOrderByFechaHoraDesc(@Param("limit") int limit);

    @Query(value = "SELECT v.id_venta, v.fecha_hora, v.metodo_pago, v.total_venta, u.nombre FROM ventas v JOIN usuarios u ON v.id_usuario = u.id_usuario ORDER BY v.fecha_hora DESC", nativeQuery = true)
    List<Object[]> findAllVentasWithUser();
    
}