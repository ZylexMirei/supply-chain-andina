package com.supplychain.backend.controllers;

import com.supplychain.backend.entities.Cliente;
import com.supplychain.backend.repositories.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "http://localhost:5173")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> getAll() {
        return clienteRepository.findAll();
    }

    @GetMapping("/{id}")
    public Cliente getById(@PathVariable Integer id) {
        return clienteRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Cliente create(@RequestBody Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    @PutMapping("/{id}")
    public Cliente update(@PathVariable Integer id, @RequestBody Cliente cliente) {
        cliente.setIdCliente(id);
        return clienteRepository.save(cliente);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        clienteRepository.deleteById(id);
    }
}