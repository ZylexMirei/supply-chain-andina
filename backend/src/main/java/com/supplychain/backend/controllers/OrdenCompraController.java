package com.supplychain.backend.controllers;

import com.supplychain.backend.entities.OrdenCompra;
import com.supplychain.backend.repositories.OrdenCompraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ordenes-compra")
@CrossOrigin(origins = "http://localhost:5173")
public class OrdenCompraController {

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    @GetMapping
    public List<OrdenCompra> getAll() {
        return ordenCompraRepository.findAll();
    }

    @GetMapping("/{id}")
    public OrdenCompra getById(@PathVariable Integer id) {
        return ordenCompraRepository.findById(id).orElse(null);
    }

    @GetMapping("/estado/{estado}")
    public List<OrdenCompra> getByEstado(@PathVariable String estado) {
        return ordenCompraRepository.findByEstado(estado);
    }

    @PostMapping
    public OrdenCompra create(@RequestBody OrdenCompra orden) {
        return ordenCompraRepository.save(orden);
    }

    @PutMapping("/{id}")
    public OrdenCompra update(@PathVariable Integer id, @RequestBody OrdenCompra orden) {
        orden.setIdOrden(id);
        return ordenCompraRepository.save(orden);
    }
}