package com.communify.communify.dto.friend;

import com.communify.communify.dto.user.UserMinimalResponseDto;
import com.communify.communify.entity.Friend;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendResponseDto {
    
    private Long id;

    private UserMinimalResponseDto user;
    
    private UserMinimalResponseDto friend;

    private String status;

    public static FriendResponseDto toDto(Friend friend) {
        return new FriendResponseDto(
            friend.getId(), 
            UserMinimalResponseDto.toDto(friend.getUser()),
            UserMinimalResponseDto.toDto(friend.getFriend()),
            friend.getStatus() != null ? friend.getStatus().name() : null
        );
    }
}
