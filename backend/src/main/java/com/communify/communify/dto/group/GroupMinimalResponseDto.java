package com.communify.communify.dto.group;

import com.communify.communify.entity.Group;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMinimalResponseDto {
    
    private Long id;

    private String name;

    private String imageUrl;

    public static GroupMinimalResponseDto toDto(Group group) {
        if (group == null) {
            return null;
        }
        return new GroupMinimalResponseDto(
            group.getId(),
            group.getName(),
            group.getImageUrl()
        );
    }
}
