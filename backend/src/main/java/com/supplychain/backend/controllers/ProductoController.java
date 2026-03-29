package com.supplychain.backend.controllers;

import com.supplychain.backend.entities.Producto;
import com.supplychain.backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> getAll() {
        return productoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Producto getById(@PathVariable Integer id) {
        return productoRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Producto create(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    @PutMapping("/{id}")
    public Producto update(@PathVariable Integer id, @RequestBody Producto producto) {
        producto.setIdProducto(id);
        return productoRepository.save(producto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        productoRepository.deleteById(id);
    }
}