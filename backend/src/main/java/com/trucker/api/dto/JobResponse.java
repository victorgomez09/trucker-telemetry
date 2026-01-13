package com.trucker.api.dto;

import java.util.List;

public record JobResponse(
    Long id,
    String citySource,
    String cityDestination,
    String cargoName,
    Long jobIncome,
    Integer plannedDistance,
    Float cargoDamage,
    List<JobEventResponse> events
) {
}
