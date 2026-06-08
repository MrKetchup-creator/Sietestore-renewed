/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 * @author JEISON :D
 */
package com.taller.crud_spring_jeison_clientes.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clientes") // Nombre de la tabla en MySQL
@Data // Anotación de Lombok: Genera automágicamente Getters, Setters, toString, equals y hashCode
@NoArgsConstructor // Anotación de Lombok: Genera el constructor vacío obligatorio para JPA
@AllArgsConstructor // Anotación de Lombok: Genera un constructor con todos los atributos
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID auto-incremental gestionado por MySQL
    private Long id;

    @Column(nullable = false, length = 100) // Restricción: No puede ser nulo y máximo 100 caracteres
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, unique = true, length = 150) // Restricción: Email único y obligatorio
    private String email;

    @Column(length = 20)
    private String telefono;
}