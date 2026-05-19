/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.taller.crud_spring_jeison_clientes.service;

import com.taller.crud_spring_jeison_clientes.model.Cliente;
import com.taller.crud_spring_jeison_clientes.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository; // Inyección de dependencia del repositorio

    // 1. Método para listar todos los clientes
    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    // 2. Método para guardar o actualizar un cliente
    public Cliente guardar(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    // 3. Método para buscar un cliente por su ID
    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    // 4. Método para eliminar un cliente por su ID
    public void eliminar(Long id) {
        clienteRepository.deleteById(id);
    }
}