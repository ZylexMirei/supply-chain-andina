package com.supplychain.backend.repositories;

import com.supplychain.backend.entities.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {}