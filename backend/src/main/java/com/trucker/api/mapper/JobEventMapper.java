package com.trucker.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.trucker.api.dto.JobEventRequest;
import com.trucker.api.dto.JobEventResponse;
import com.trucker.api.entity.JobEventEntity;
import com.trucker.api.entity.JobEventTypeEnum;

@Mapper(componentModel = "spring")
public interface JobEventMapper {

    @Mapping(source = "amount", target = "value")
    JobEventResponse toDto(JobEventEntity jobEventEntity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "job", ignore = true)
    @Mapping(source = "eventType", target = "type", qualifiedByName = "mapEnum")
    @Mapping(source = "value", target = "amount")
    @Mapping(source = "text", target = "description")
    JobEventEntity toEntity(JobEventRequest jobEventDto);

    @Named("mapEnum")
    default JobEventTypeEnum mapEnum(Integer eventType) {
        return JobEventTypeEnum.fromCode(eventType);
    }
}
