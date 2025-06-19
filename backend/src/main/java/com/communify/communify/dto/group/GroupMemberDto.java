package com.communify.communify.dto.group;

import java.time.LocalDateTime;

import com.communify.communify.dto.user.UserMinimalResponseDto;
import com.communify.communify.entity.GroupMember;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberDto {

    private String role;
    
    private LocalDateTime joinedAt;
    
    private UserMinimalResponseDto user;

    public static GroupMemberDto toDto(GroupMember groupMember) {
        return new GroupMemberDto(
            groupMember.getRole() != null ? groupMember.getRole().name() : null,
            groupMember.getCreatedAt(),
            groupMember.getUser() != null ? UserMinimalResponseDto.toDto(groupMember.getUser()) : null
        );
    }
}
