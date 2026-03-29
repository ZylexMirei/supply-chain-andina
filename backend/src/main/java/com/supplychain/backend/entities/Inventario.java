package com.supplychain.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "inventario")
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idInventario;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "id_almacen", nullable = false)
    private Almacen almacen;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "stock_minimo")
    private Integer stockMinimo;

    @Column(name = "stock_maximo")
    private Integer stockMaximo;
}