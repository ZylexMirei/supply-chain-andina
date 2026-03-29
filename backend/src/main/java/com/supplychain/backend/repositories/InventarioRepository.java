package com.supplychain.backend.repositories;

import com.supplychain.backend.entities.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface InventarioRepository extends JpaRepository<Inventario, Integer> {

    List<Inventario> findByAlmacen_IdAlmacen(Integer idAlmacen);

    // ⭐ Consulta ROP - productos bajo stock mínimo
    @Query("SELECT i FROM Inventario i WHERE i.cantidad <= i.stockMinimo")
    List<Inventario> findAlertasReorden();
}