package com.communify.communify.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.communify.communify.dto.post.PostRequestDto;
import com.communify.communify.dto.post.PostResponseDto;
import com.communify.communify.entity.User;
import com.communify.communify.exception.GroupNotFoundException;
import com.communify.communify.exception.PostNotFoundException;
import com.communify.communify.exception.UserNotFoundException;
import com.communify.communify.service.FileService;
import com.communify.communify.service.LikeService;
import com.communify.communify.service.PostService;
import com.communify.communify.service.RecommendationService;

import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.ServerException;
import io.minio.errors.XmlParserException;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequiredArgsConstructor
public class PostController {

    private final PostService service;
    private final FileService fileService;
    private final LikeService likeService;
    private final RecommendationService recommendationService;

    @GetMapping("/presignedUrl")
    public String getPresignedUrl(@RequestParam String name) 
    throws InvalidKeyException, ErrorResponseException, InsufficientDataException, 
    InternalException, InvalidResponseException, NoSuchAlgorithmException, 
    XmlParserException, ServerException, IllegalArgumentException, IOException {
        return fileService.getPresignedUrl(name);
    }
    
    @GetMapping("/getLoadedImage")
    public String getLoadedImage(@RequestParam String name) 
    throws InvalidKeyException, ErrorResponseException, InsufficientDataException, 
    InternalException, InvalidResponseException, NoSuchAlgorithmException, 
    XmlParserException, ServerException, IllegalArgumentException, IOException {
        return fileService.getLoadedFileUrl(name);
    }

    @GetMapping("/posts/feed")
    public Page<PostResponseDto> getLatest(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 10, sort = {"createdAt", "id"}, direction = Direction.DESC) Pageable pageable) {
        return service.getLatestPosts(pageable, user);
    }

    @GetMapping("/recommendations")
    public Page<PostResponseDto> getRecommendations(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 10) Pageable pageable) {
        return recommendationService.getRecommendedPosts(user.getId(), pageable, user);
    }

    @PostMapping("/posts/new")
    public PostResponseDto create(
            @RequestPart("post") PostRequestDto post,
            @RequestPart(value = "image", required = false) MultipartFile imageFile)
            throws UserNotFoundException, GroupNotFoundException {
        return service.create(post, imageFile);
    }

    @GetMapping("/posts/{id}")
    public PostResponseDto getById(@PathVariable Long id, @AuthenticationPrincipal User user) throws PostNotFoundException {
        return service.getById(id, user);
    }

    @DeleteMapping("/posts/{id}/delete")
    public Long delete(@PathVariable Long id) {
        return service.delete(id);
    }

    @PostMapping("/posts/{postId}/like")
    public void likePost(@PathVariable Long postId, @AuthenticationPrincipal User user) {
        likeService.likePost(postId, user);
    }

    @DeleteMapping("/posts/{postId}/unlike")
    public void unlikePost(@PathVariable Long postId, @AuthenticationPrincipal User user) {
        likeService.unlikePost(postId, user);
    }
}