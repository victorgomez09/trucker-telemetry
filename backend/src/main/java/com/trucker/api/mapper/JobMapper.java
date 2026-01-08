package com.trucker.api.mapper;

import org.mapstruct.Mapper;

import com.trucker.api.dto.JobDto;
import com.trucker.api.entity.JobEntity;

@Mapper(componentModel = "spring")
public interface JobMapper {

    JobDto toDto(JobEntity jobEntity);

    JobEntity toEntity(JobDto jobDto);
}
