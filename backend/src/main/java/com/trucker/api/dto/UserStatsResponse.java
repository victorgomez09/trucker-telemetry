package com.trucker.api.dto;

public record UserStatsResponse(
    Long totalJobs,
    Double totalKm,
    Long totalIncome,
    Double avgConsumption
) {
}