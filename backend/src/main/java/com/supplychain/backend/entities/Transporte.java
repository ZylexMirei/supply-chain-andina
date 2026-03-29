package com.supplychain.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "transporte")
public class Transporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_transporte")
    private Integer idTransporte;

    @Column(name = "tipo", length = 50)
    private String tipo;

    @Column(name = "empresa_logistica", length = 100)
    private String empresaLogistica;
}