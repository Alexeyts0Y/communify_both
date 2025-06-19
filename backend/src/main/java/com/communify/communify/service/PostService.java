package com.communify.communify.service;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.communify.communify.repository.GroupRepository;
import com.communify.communify.repository.PostRepository;
import com.communify.communify.repository.UserRepository;

import io.minio.errors.MinioException;

import com.communify.communify.dto.post.PostRequestDto;
import com.communify.communify.dto.post.PostResponseDto;
import com.communify.communify.entity.Post;
import com.communify.communify.entity.User;
import com.communify.communify.exception.GroupNotFoundException;
import com.communify.communify.exception.PostNotFoundException;
import com.communify.communify.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final FileService fileService;
    private final LikeService likeService;

    private static final String POST_IMAGE_FOLDER = "postImage";

    public Page<PostResponseDto> getLatestPosts(Pageable pageable, User currentUser) {
        Page<Post> postsPage = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        return postsPage.map(post -> PostResponseDto.toDto(post, likeService.hasUserLikedPost(post.getId(), currentUser)));
    }

    @Transactional
    public PostResponseDto create(PostRequestDto postRequestDto, MultipartFile image)
            throws UserNotFoundException, GroupNotFoundException {
        Post post = PostRequestDto.toEntity(postRequestDto);

        Long userId = postRequestDto.getUserId();
        Long groupId = postRequestDto.getGroupId();

        if (userId != null) {
            post.setUser(userRepository.findById(userId)
                                       .orElseThrow(() -> new UserNotFoundException("Пользователь с таким id не найден")));
        }
        if (groupId != null) {
            post.setGroup(groupRepository.findById(groupId)
                                         .orElseThrow(() -> new GroupNotFoundException("Группы с таким id не существует")));
        }

        if (image != null && !image.isEmpty()) {
            try {
                String objectName = fileService.uploadFile(image, POST_IMAGE_FOLDER);
                post.setImageUrl(fileService.getFileUrl(objectName));
            } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
                throw new RuntimeException("Ошибка загрузки фотографии: " + e.getMessage(), e);
            }
        }

        post.setCreatedAt(LocalDateTime.now());
        postRepository.save(post);

        return PostResponseDto.toDto(post, false);
    }

    public PostResponseDto getById(Long id, User currentUser) throws PostNotFoundException{
        Post post = postRepository
            .findById(id)
            .orElseThrow(() -> new PostNotFoundException("Пост с таким id не найден"));
        return PostResponseDto.toDto(post, likeService.hasUserLikedPost(post.getId(), currentUser));
    }

    @Transactional
    @CacheEvict(value = "userRecommendations", allEntries = true)
    public Long delete(Long id) {
        postRepository.deleteById(id);
        return id;
    }
}
