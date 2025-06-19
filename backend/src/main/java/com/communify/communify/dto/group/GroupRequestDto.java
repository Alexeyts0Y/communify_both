package com.communify.communify.dto.group;

import java.time.LocalDateTime;

import com.communify.communify.entity.Group;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupRequestDto {
    
    private String name;

    private String description;

    private String imageUrl;

    private Long userId;

    public static Group toEntity(GroupRequestDto dto) {
        return Group.builder()
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .imageUrl(dto.getImageUrl())
                    .createdAt(LocalDateTime.now())
                    .build();
    }
}
