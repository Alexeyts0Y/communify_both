package com.communify.communify.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.communify.communify.dto.Token;
import com.communify.communify.dto.user.UserLoginDto;
import com.communify.communify.dto.user.UserRequestDto;
import com.communify.communify.dto.user.UserResponseDto;
import com.communify.communify.service.AuthService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService service;

    @PostMapping("/login")
    public Token postMethodName(@RequestBody UserLoginDto dto) {
        return service.login(dto);
    }

    @PostMapping("/register")
    public UserResponseDto postMethodName(@RequestBody UserRequestDto dto) {    
        return service.register(dto);
    }
    
}
