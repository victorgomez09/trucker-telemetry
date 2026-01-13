package com.trucker.api.dto;

public record JobEventResponse(
    Integer type,
    String description,
    Long value
) {

}
