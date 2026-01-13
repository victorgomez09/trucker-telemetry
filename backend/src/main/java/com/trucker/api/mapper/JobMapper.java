package com.trucker.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.trucker.api.dto.JobRequest;
import com.trucker.api.dto.JobResponse;
import com.trucker.api.entity.JobEntity;

@Mapper(componentModel = "spring", uses = {JobEventMapper.class})
public interface JobMapper {

    @Mapping(source = "sourceCity", target = "citySource")
    @Mapping(source = "destinationCity", target = "cityDestination")
    @Mapping(source = "income", target = "jobIncome")
    @Mapping(source = "distanceKm", target = "plannedDistance")
    @Mapping(source = "cargoDamagePerc", target = "cargoDamage")
    JobResponse toDto(JobEntity jobEntity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", constant = "COMPLETED")
    @Mapping(source = "jobIncome", target = "income")
    @Mapping(source = "plannedDistance", target = "distanceKm")
    @Mapping(source = "cargoDamage", target = "cargoDamagePerc")
    @Mapping(source = "citySource", target = "sourceCity")
    @Mapping(source = "cityDestination", target = "destinationCity")
    JobEntity toEntity(JobRequest jobDto);
}