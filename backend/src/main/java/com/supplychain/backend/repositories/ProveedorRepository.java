package com.supplychain.backend.repositories;

import com.supplychain.backend.entities.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {}