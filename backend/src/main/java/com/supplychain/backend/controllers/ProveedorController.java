package com.supplychain.backend.controllers;

import com.supplychain.backend.entities.Proveedor;
import com.supplychain.backend.repositories.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "http://localhost:5173")
public class ProveedorController {

    @Autowired
    private ProveedorRepository proveedorRepository;

    @GetMapping
    public List<Proveedor> getAll() {
        return proveedorRepository.findAll();
    }

    @GetMapping("/{id}")
    public Proveedor getById(@PathVariable Integer id) {
        return proveedorRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Proveedor create(@RequestBody Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    @PutMapping("/{id}")
    public Proveedor update(@PathVariable Integer id, @RequestBody Proveedor proveedor) {
        proveedor.setIdProveedor(id);
        return proveedorRepository.save(proveedor);
    }
}