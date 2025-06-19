package com.communify.communify.dto.user;

import com.communify.communify.entity.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMinimalResponseDto {
    
    private Long id;

    private String avatarUrl;

    private String firstName;

    private String lastName;

    public static UserMinimalResponseDto toDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserMinimalResponseDto(
            user.getId(), 
            user.getAvatarUrl(),
            user.getFirstName(),
            user.getLastName());
    }

}
