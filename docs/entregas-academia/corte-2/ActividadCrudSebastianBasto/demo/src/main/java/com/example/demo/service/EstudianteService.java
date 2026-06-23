
package com.example.demo.service;

/**
 *
 * @author ASUS
 */

import com.example.demo.model.Estudiante;
import com.example.demo.repository.EstudianteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EstudianteService {
    @Autowired
    private EstudianteRepository repository;

    public List<Estudiante> listar() {
        return repository.findAll();
    }

    public Estudiante guardar(Estudiante estudiante) {
        return repository.save(estudiante);
    }

    public Optional<Estudiante> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    } 
}
