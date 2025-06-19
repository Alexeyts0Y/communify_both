package com.communify.communify.dto.group;

import java.time.LocalDateTime;
import java.util.List;

import com.communify.communify.dto.post.PostResponseDto;
import com.communify.communify.entity.Group;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponseDto {
    
    private Long id;

    private String name;
    
    private String imageUrl;

    private String description;

    private LocalDateTime createdAt;

    private Long creatorId;

    private List<GroupMemberDto> members;

    private List<PostResponseDto> posts;

    public static GroupResponseDto toDto(Group group) {
        return new GroupResponseDto(
            group.getId(),
            group.getName(),
            group.getImageUrl(),
            group.getDescription(),
            group.getCreatedAt(),
            group.getCreator() != null ? group.getCreator().getId() : null,
            group.getMembers() != null ? group.getMembers()
                 .stream()
                 .map(GroupMemberDto::toDto)
                 .toList() : null,
            group.getPosts() != null ? group.getPosts()
                 .stream()
                 .map(PostResponseDto::toDto)
                 .toList() : null
        );
    }
}
