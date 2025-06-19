package com.communify.communify.dto.user;

import com.communify.communify.dto.group.GroupMinimalResponseDto;
import com.communify.communify.entity.GroupMember;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserGroupDto {
    
    private String role;

    private GroupMinimalResponseDto group;

    public static UserGroupDto toDto(GroupMember member) {
        return new UserGroupDto(
            member.getRole().name() != null ? member.getRole().name() : null,
            member.getGroup() != null ? GroupMinimalResponseDto.toDto(member.getGroup()) : null
        );
    }
}
