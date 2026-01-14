package com.trucker.api.dto;

import java.util.List;

public record DashboardResponse(
    UserStatsResponse stats,
    List<JobResponse> jobs
) {

}
