package com.supplychain.backend.repositories;

import com.supplychain.backend.entities.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpleadoRepository extends JpaRepository<Empleado, Integer> {}