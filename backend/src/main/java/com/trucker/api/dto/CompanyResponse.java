package com.trucker.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CompanyResponse(
    Long id,
    String name,
    String tag,
    LocalDateTime createdAt,
    List<UserResponse> members,
    List<JobResponse> jobs
) {

}
