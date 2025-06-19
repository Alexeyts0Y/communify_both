package com.communify.communify.dto.post;

import java.time.LocalDateTime;

import com.communify.communify.dto.group.GroupMinimalResponseDto;
import com.communify.communify.dto.user.UserMinimalResponseDto;
import com.communify.communify.entity.Post;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostResponseDto {
    
    private Long id;

    private String content;

    private String imageUrl;

    private LocalDateTime createdAt;

    private UserMinimalResponseDto author;

    private GroupMinimalResponseDto group;

    private Long likeCount;

    private boolean isLikedByCurrentUser = false;

    public static PostResponseDto toDto(Post post, boolean isLikedByCurrentUser) {
        Long likeCount = Long.valueOf((post.getLikes() != null) ? (long) post.getLikes().size() : 0L);
        
        return new PostResponseDto(
            post.getId(),
            post.getContent(),
            post.getImageUrl(),
            post.getCreatedAt(),
            post.getUser() != null ? UserMinimalResponseDto.toDto(post.getUser()) : null,
            post.getGroup() != null ? GroupMinimalResponseDto.toDto(post.getGroup()) : null,
            likeCount,
            isLikedByCurrentUser
        );
    }

    // Overloaded toDto for cases where current user context is not available (e.g., nested DTOs)
    public static PostResponseDto toDto(Post post) {
        // Default to false if current user context is not passed
        return toDto(post, false);
    }

}