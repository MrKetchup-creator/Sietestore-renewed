
package com.example.demo.model;

/**
 *
 * @author ASUS
 */

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "estudiantes")
public class Estudiante {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String carrera;

    private int semestre;
    
}
