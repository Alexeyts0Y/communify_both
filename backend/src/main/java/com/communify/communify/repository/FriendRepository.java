package com.communify.communify.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.communify.communify.entity.Friend;
import com.communify.communify.entity.User;
import com.communify.communify.enums.FriendshipStatus;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {

    Optional<List<Friend>> findAllByUserAndStatus(User user, FriendshipStatus status);

    Optional<List<Friend>> findAllByFriendAndStatus(User friend, FriendshipStatus status);

    Boolean existsByUserAndStatus(User user, FriendshipStatus status);

    @Query("""
    SELECT f FROM Friend f 
    WHERE (f.user = :user AND f.status = :status) 
    OR (f.friend = :friend AND f.status = :status)""")
    Optional<List<Friend>> findAllByUserOrFriendAndStatus(
        @Param("user") User user, 
        @Param("friend") User friend, 
        @Param("status") FriendshipStatus status
    );

    Boolean existsByUserAndFriendAndStatus(User user, User friend, FriendshipStatus accepted);
}