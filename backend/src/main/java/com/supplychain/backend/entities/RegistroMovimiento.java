package com.supplychain.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "registromovimiento")
public class RegistroMovimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idMovimiento;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(nullable = false)
    private Integer cantidad;

    @ManyToOne
    @JoinColumn(name = "id_almacen_origen")
    private Almacen almacenOrigen;

    @ManyToOne
    @JoinColumn(name = "id_almacen_destino")
    private Almacen almacenDestino;

    private LocalDateTime fecha;

    @Column(length = 200)
    private String motivo;
}