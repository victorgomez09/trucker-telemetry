package com.trucker.api.dto;

import java.util.List;

public record CompanySummaryResponse(
    String companyName,
    String companyTag,
    Long totalJobs,
    Double totalKilometers,
    List<CompanyJobProjection> recentJobs
) {}