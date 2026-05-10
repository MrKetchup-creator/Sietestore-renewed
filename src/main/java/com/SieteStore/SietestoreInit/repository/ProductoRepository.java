package com.SieteStore.SietestoreInit.repository;

import com.SieteStore.SietestoreInit.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrue(); // Para no mostrar productos "eliminados"
}