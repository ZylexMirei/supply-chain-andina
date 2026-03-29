package com.supplychain.backend.repositories;

import com.supplychain.backend.entities.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    List<Pedido> findByEstado(String estado);
    List<Pedido> findByCliente_IdCliente(Integer idCliente);
}