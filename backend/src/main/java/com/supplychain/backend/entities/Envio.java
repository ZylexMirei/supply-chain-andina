package com.supplychain.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "envio")
public class Envio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEnvio;

    @ManyToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_transporte", nullable = false)
    private Transporte transporte;

    private LocalDate fechaEnvio;

    @Column(length = 50)
    private String estado;
}