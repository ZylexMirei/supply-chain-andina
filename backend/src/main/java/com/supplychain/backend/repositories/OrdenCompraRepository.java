package com.supplychain.backend.repositories;

import com.supplychain.backend.entities.OrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Integer> {
    List<OrdenCompra> findByEstado(String estado);
    List<OrdenCompra> findByProveedor_IdProveedor(Integer idProveedor);
}