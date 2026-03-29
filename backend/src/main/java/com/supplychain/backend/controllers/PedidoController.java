package com.supplychain.backend.controllers;

import com.supplychain.backend.entities.Pedido;
import com.supplychain.backend.repositories.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:5173")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @GetMapping
    public List<Pedido> getAll() {
        return pedidoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Pedido getById(@PathVariable Integer id) {
        return pedidoRepository.findById(id).orElse(null);
    }

    @GetMapping("/estado/{estado}")
    public List<Pedido> getByEstado(@PathVariable String estado) {
        return pedidoRepository.findByEstado(estado);
    }

    @PostMapping
    public Pedido create(@RequestBody Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    @PutMapping("/{id}")
    public Pedido update(@PathVariable Integer id, @RequestBody Pedido pedido) {
        pedido.setIdPedido(id);
        return pedidoRepository.save(pedido);
    }
}