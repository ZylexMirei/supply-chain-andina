package com.supplychain.backend.repositories;

import com.supplychain.backend.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByCategoria_IdCategoria(Integer idCategoria);
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}