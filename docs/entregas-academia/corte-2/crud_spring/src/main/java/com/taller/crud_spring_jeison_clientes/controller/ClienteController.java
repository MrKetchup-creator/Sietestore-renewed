/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.taller.crud_spring_jeison_clientes.controller;

import com.taller.crud_spring_jeison_clientes.model.Cliente;
import com.taller.crud_spring_jeison_clientes.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes") // Ruta base para todos los endpoints de este controlador
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // 1. OBTENER TODOS LOS CLIENTES (GET)
    @GetMapping
    public List<Cliente> obtenerTodos() {
        return clienteService.listar();
    }

    // 2. OBTENER UN CLIENTE POR ID (GET)
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtenerPorId(@PathVariable Long id) {
        return clienteService.buscarPorId(id)
                .map(cliente -> ResponseEntity.ok(cliente))
                .orElse(ResponseEntity.notFound().build()); // Retorna 404 si no existe
    }

    // 3. CREAR UN NUEVO CLIENTE (POST)
    @PostMapping
    public Cliente crear(@RequestBody Cliente cliente) {
        return clienteService.guardar(cliente);
    }

    // 4. ACTUALIZAR UN CLIENTE EXISTENTE (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizar(@PathVariable Long id, @RequestBody Cliente detallesCliente) {
        return clienteService.buscarPorId(id)
                .map(clienteExistente -> {
                    clienteExistente.setNombre(detallesCliente.getNombre());
                    clienteExistente.setApellido(detallesCliente.getApellido());
                    clienteExistente.setEmail(detallesCliente.getEmail());
                    clienteExistente.setTelefono(detallesCliente.getTelefono());
                    Cliente actualizado = clienteService.guardar(clienteExistente);
                    return ResponseEntity.ok(actualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. ELIMINAR UN CLIENTE (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return clienteService.buscarPorId(id)
                .map(cliente -> {
                    clienteService.eliminar(id);
                    return ResponseEntity.ok().<Void>build(); // Retorna 200 OK si elimina con éxito
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
