package com.communify.communify.dto.post;

import java.time.LocalDateTime;

import com.communify.communify.entity.Post;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostRequestDto {

    private String content;

    private String imageUrl;

    private Long userId;

    private Long groupId;

    public static Post toEntity(PostRequestDto dto) {
        return Post.builder()
                   .content(dto.getContent())
                   .createdAt(LocalDateTime.now())
                   .imageUrl(dto.getImageUrl())
                   .build();
    }
}