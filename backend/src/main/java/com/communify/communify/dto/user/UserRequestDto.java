package com.communify.communify.dto.user;


import com.communify.communify.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDto {
    
    private String username;

    private String email;

    private String firstName;

    private String lastName;

    private String password;

    public static User toEntity(UserRequestDto dto) {
        return User.builder()
                   .username(dto.username)
                   .email(dto.getEmail())
                   .firstName(dto.getFirstName())
                   .lastName(dto.getLastName())
                   .password(dto.getPassword())
                   .build();
    }
}
