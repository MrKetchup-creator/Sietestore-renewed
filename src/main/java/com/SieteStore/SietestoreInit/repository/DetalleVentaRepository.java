/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.repository;
import com.SieteStore.SietestoreInit.model.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
/**
 *
 * @author JEISON
 */
@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {
}
