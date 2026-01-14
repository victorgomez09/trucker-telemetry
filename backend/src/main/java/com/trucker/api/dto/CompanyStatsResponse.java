package com.trucker.api.dto;

public record CompanyStatsResponse(
    Long totalJobs,
    Double totalKilometers
) {}