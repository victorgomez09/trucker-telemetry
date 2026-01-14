package com.trucker.api.mapper;

import org.mapstruct.Mapper;

import com.trucker.api.dto.UserResponse;
import com.trucker.api.entity.UserEntity;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toDto(UserEntity entity);
}
