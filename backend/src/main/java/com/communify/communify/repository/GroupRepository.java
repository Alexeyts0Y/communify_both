package com.communify.communify.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.communify.communify.entity.Group;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long>{
    boolean existsByName(String name);
    
    @Override
    @Transactional
    @Modifying
    @Query("DELETE FROM Group g WHERE g.id = :id")
    void deleteById(@Param("id") Long id);

    @Query(value = "SELECT * FROM groups ORDER BY RANDOM()", nativeQuery = true)
    List<Group> findRandomGroups(Pageable pageable);
}
