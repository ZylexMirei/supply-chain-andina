package com.supplychain.backend.repositories;

import com.supplychain.backend.entities.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {}