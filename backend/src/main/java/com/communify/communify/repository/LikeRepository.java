package com.communify.communify.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.communify.communify.entity.Like;
import com.communify.communify.entity.Post;
import com.communify.communify.entity.User;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    boolean existsByUserAndPost(User user, Post post);

    Optional<Like> findByUserAndPost(User user, Post post);

    long countByPost(Post post);
    
}
