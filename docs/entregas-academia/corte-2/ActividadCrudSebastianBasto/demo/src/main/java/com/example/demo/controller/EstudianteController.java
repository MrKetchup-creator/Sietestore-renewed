
package com.example.demo.controller;

/**
 *
 * @author ASUS
 */

import com.example.demo.model.Estudiante;
import com.example.demo.service.EstudianteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/estudiantes")
public class EstudianteController {
    
    @Autowired
    private EstudianteService service;

    @GetMapping
    public List<Estudiante> listar() {
        return service.listar();
    }

    @PostMapping
    public Estudiante guardar(@RequestBody Estudiante estudiante) {
        return service.guardar(estudiante);
    }

    @GetMapping("/{id}")
    public Optional<Estudiante> buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @PutMapping("/{id}")
    public Estudiante actualizar(@PathVariable Long id,
                                 @RequestBody Estudiante estudiante) {

        Estudiante actual = service.buscarPorId(id).orElse(null);

        if (actual != null) {

            actual.setNombre(estudiante.getNombre());
            actual.setCarrera(estudiante.getCarrera());
            actual.setSemestre(estudiante.getSemestre());

            return service.guardar(actual);
        }

        return null;
    }
    
}
