/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.controller;

import com.SieteStore.SietestoreInit.model.Cliente;
import com.SieteStore.SietestoreInit.repository.ClienteRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteRepository.findByActivoTrue();
    }

    @PostMapping
    public Cliente guardar(@RequestBody Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    @GetMapping("/buscar/{cedula}")
    public Cliente buscarPorCedula(@PathVariable String cedula) {

        return clienteRepository.findByCedulaNit(cedula)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado"));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {

        clienteRepository.findById(id).ifPresent(cliente -> {

            cliente.setActivo(false);

            clienteRepository.save(cliente);
        });
    }
}