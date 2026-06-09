package com.SieteStore.SietestoreInit.controller;
/**
 *
 * @author BASTO
 */
import com.SieteStore.SietestoreInit.model.Cliente;
import com.SieteStore.SietestoreInit.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteRepository.findByActivoTrue();
    }

    @GetMapping("/{id}")
    public Cliente buscarPorId(@PathVariable Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @GetMapping("/cedula/{cedulaNit}")
    public Cliente buscarPorCedula(@PathVariable String cedulaNit) {
        return clienteRepository.findByCedulaNit(cedulaNit)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @PostMapping
    public Cliente guardar(@RequestBody Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    @PutMapping("/{id}")
    public Cliente actualizar(
            @PathVariable Integer id,
            @RequestBody Cliente clienteActualizado) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        cliente.setCedulaNit(clienteActualizado.getCedulaNit());
        cliente.setNombreCompleto(clienteActualizado.getNombreCompleto());
        cliente.setTelefono(clienteActualizado.getTelefono());
        cliente.setCorreoElectronico(clienteActualizado.getCorreoElectronico());

        return clienteRepository.save(cliente);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        cliente.setActivo(false);

        clienteRepository.save(cliente);
    }
}