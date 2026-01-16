package com.trucker.api.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trucker.api.dto.UserResponse;
import com.trucker.api.entity.UserEntity;
import com.trucker.api.mapper.UserMapper;
import com.trucker.api.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Principal principal) {
        // Principal es inyectado automáticamente por Spring Security 
        // si el usuario está autenticado.
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        UserEntity user = userService.findByUsername(principal.getName());

        return ResponseEntity.ok(userMapper.toDto(user));
    }
}
