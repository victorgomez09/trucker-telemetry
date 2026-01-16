package com.trucker.api.mapper;

import org.mapstruct.Mapper;

import com.trucker.api.dto.CompanyRequest;
import com.trucker.api.dto.CompanyResponse;
import com.trucker.api.entity.CompanyEntity;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    CompanyResponse toDto(CompanyEntity entity);

    CompanyEntity toEntity(CompanyRequest request);
}
