/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.service;

/**
 *
 * @author ASUS
 */

import com.example.demo.model.Producto;
import com.example.demo.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {
    
     @Autowired
    private ProductoRepository repository;

    // LISTAR
    public List<Producto> listar() {
        return repository.findAll();
    }

    // GUARDAR
    public Producto guardar(Producto producto) {
        return repository.save(producto);
    }

    // BUSCAR POR ID
    public Optional<Producto> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // ELIMINAR
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
    
    
}
