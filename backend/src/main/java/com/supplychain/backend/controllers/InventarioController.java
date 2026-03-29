package com.supplychain.backend.controllers;

import com.supplychain.backend.entities.Inventario;
import com.supplychain.backend.repositories.InventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "http://localhost:5173")
public class InventarioController {

    @Autowired
    private InventarioRepository inventarioRepository;

    @GetMapping
    public List<Inventario> getAll() {
        return inventarioRepository.findAll();
    }

    @GetMapping("/almacen/{id}")
    public List<Inventario> getByAlmacen(@PathVariable Integer id) {
        return inventarioRepository.findByAlmacen_IdAlmacen(id);
    }

    // ⭐ Endpoint del ROP - alertas de reorden
    @GetMapping("/alertas-reorden")
    public List<Inventario> getAlertasReorden() {
        return inventarioRepository.findAlertasReorden();
    }

    @PutMapping("/{id}")
    public Inventario update(@PathVariable Integer id, @RequestBody Inventario inventario) {
        inventario.setIdInventario(id);
        return inventarioRepository.save(inventario);
    }
}