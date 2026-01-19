package com.trucker.api.dto;

import java.util.Date;
import java.util.List;

public record JobResponse(
    Long id,
    String citySource,
    String companySource,
    String cityDestination,
    String companyDestination,
    String cargoName,
    Long jobIncome,
    Integer plannedDistance,
    String truckName,
    Double truckkm,
    Float cargoDamage,
    Double totalFuelLiters,
    Double cargoMassKg,
    Date createdAt,
    List<JobEventResponse> events
) {
}
