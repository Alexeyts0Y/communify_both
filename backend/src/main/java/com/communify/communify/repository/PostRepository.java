package com.communify.communify.repository;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


import com.communify.communify.entity.Post;
import com.communify.communify.entity.User;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>{

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Optional<List<Post>> findAllByUser(User user);
}