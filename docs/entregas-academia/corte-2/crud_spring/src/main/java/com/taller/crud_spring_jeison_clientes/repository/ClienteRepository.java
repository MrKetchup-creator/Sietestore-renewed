/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
/**
 * @author JEISON :D
 */
package com.taller.crud_spring_jeison_clientes.repository;

import com.taller.crud_spring_jeison_clientes.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // No requiere código aquí por ahora, JpaRepository ya tiene todo el CRUD base.
}