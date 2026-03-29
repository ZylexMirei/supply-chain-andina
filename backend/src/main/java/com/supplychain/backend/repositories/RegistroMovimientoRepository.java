package com.supplychain.backend.repositories;

import com.supplychain.backend.entities.RegistroMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistroMovimientoRepository extends JpaRepository<RegistroMovimiento, Integer> {
    List<RegistroMovimiento> findByEmpleado_IdEmpleado(Integer idEmpleado);
    List<RegistroMovimiento> findByTipo(String tipo);
}