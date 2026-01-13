package com.trucker.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record JobEventRequest(
    @JsonProperty("event_type") Integer eventType,
    Integer value,
    String text,
    Long timestamp
) {}