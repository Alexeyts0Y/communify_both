package com.communify.communify.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.communify.communify.entity.Group;
import com.communify.communify.entity.GroupMember;
import com.communify.communify.entity.User;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    void deleteByUserAndGroup(User user, Group group);
    boolean existsByUserAndGroup(User user, Group group);
    Optional<GroupMember> findByUserAndGroup(User user, Group group); 
}
