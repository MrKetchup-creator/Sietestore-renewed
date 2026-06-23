
package com.example.demo.repository;

/**
 *
 * @author ASUS
 */
import com.example.demo.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

}
