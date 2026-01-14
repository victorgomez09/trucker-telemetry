package com.trucker.api.dto;

import java.time.LocalDateTime;

public record CompanyJobProjection(
    String sourceCity,
    String destinationCity,
    String cargoName,
    Float cargoMass, // Peso de la carga
    LocalDateTime createdAt
) {}