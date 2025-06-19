package com.communify.communify.service;

import java.util.Optional;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.communify.communify.entity.Like;
import com.communify.communify.entity.Post;
import com.communify.communify.entity.User;
import com.communify.communify.exception.PostNotFoundException;
import com.communify.communify.repository.LikeRepository;
import com.communify.communify.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;

    @Transactional
    @CacheEvict(value = "userRecommendations", key = "#user.id")
    public void likePost(Long postId, User user) {
        Post post = postRepository
            .findById(postId)
            .orElseThrow(() -> new PostNotFoundException("Post not found."));

        if (!likeRepository.existsByUserAndPost(user, post)) {
            Like like = Like.builder()
                    .user(user)
                    .post(post)
                    .build();
            likeRepository.save(like);
        }
    }

    @Transactional
    @CacheEvict(value = "userRecommendations", key = "#user.id")
    public void unlikePost(Long postId, User user) {
        Post post = postRepository
            .findById(postId)
            .orElseThrow(() -> new PostNotFoundException("Post not found."));

        Optional<Like> like = likeRepository.findByUserAndPost(user, post);
        like.ifPresent(likeRepository::delete);
    }

    public long getLikesCount(Long postId) {
        Post post = postRepository
            .findById(postId)
            .orElseThrow(() -> new PostNotFoundException("Post not found."));
        return likeRepository.countByPost(post);
    }

    public boolean hasUserLikedPost(Long postId, User user) {
        Post post = postRepository
            .findById(postId)
            .orElseThrow(() -> new PostNotFoundException("Post not found"));
        return likeRepository.existsByUserAndPost(user, post);
    }
}