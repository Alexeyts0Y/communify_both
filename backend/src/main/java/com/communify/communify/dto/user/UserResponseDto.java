package com.communify.communify.dto.user;

import java.time.LocalDateTime;
import java.util.List;

import com.communify.communify.dto.post.PostResponseDto;
import com.communify.communify.entity.User;
import com.communify.communify.entity.Post;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    
    private Long id;

    private String username;

    private String email;

    private String firstName;

    private String lastName;

    private String avatarUrl;

    private LocalDateTime createdAt;

    private List<PostResponseDto> posts;

    private List<UserGroupDto> groups;

    public static UserResponseDto toDto(User user) {
        List<Post> userPosts = user.getPosts() != null ?
            user.getPosts()
                .stream()
                .filter(post -> post.getGroup() == null)
                .toList() : null;

        return new UserResponseDto(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getAvatarUrl(),
            user.getCreatedAt(),
            userPosts.stream()
                     .map(PostResponseDto::toDto)
                     .toList(),
            user.getGroupMemberships() != null ?
                user.getGroupMemberships()
                    .stream()
                    .map(UserGroupDto::toDto)
                    .toList() : null
        );
    }
}