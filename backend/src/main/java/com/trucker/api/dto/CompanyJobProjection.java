package com.trucker.api.dto;

import java.util.Date;

public record CompanyJobProjection(
        String sourceCity,
        String destinationCity,
        String cargoName,
        Float cargoMass,
        Date createdAt) {

    public CompanyJobProjection(String sourceCity,
            String destinationCity,
            String cargoName,
            Float cargoMass,
            Date createdAt) {
        this.sourceCity = sourceCity;
        this.destinationCity = destinationCity;
        this.cargoName = cargoName;
        this.cargoMass = cargoMass;
        this.createdAt = createdAt;
    }
}