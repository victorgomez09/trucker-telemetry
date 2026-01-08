package com.trucker.api.dto;

public record JobEventDto(
    Integer type,
    String description,
    Long value
) {

}
