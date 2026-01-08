package com.trucker.api.mapper;

import org.mapstruct.Mapper;

import com.trucker.api.dto.JobEventDto;
import com.trucker.api.entity.JobEventEntity;

@Mapper(componentModel = "spring")
public interface JobEventMapper {

    JobEventDto toDto(JobEventEntity jobEventEntity);

    JobEventEntity toEntity(JobEventDto jobEventDto);
}
