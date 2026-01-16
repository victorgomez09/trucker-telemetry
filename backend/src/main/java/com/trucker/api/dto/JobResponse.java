package com.trucker.api.dto;

import java.util.Date;
import java.util.List;

public record JobResponse(
    Long id,
    String citySource,
    String cityDestination,
    String cargoName,
    Long jobIncome,
    Integer plannedDistance,
    Float cargoDamage,
    Double totalFuelLiters,
    Double cargoMassKg,
    Date createdAt,
    List<JobEventResponse> events
) {
}
