package com.communify.communify.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.communify.communify.dto.group.GroupMemberDto;
import com.communify.communify.dto.group.GroupMinimalResponseDto;
import com.communify.communify.dto.group.GroupRequestDto;
import com.communify.communify.dto.group.GroupResponseDto;
import com.communify.communify.entity.User;
import com.communify.communify.exception.GroupAlreadyExistsException;
import com.communify.communify.exception.GroupNotFoundException;
import com.communify.communify.exception.UserNotFoundException;
import com.communify.communify.service.GroupService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {
    
    private final GroupService service;

    @GetMapping("/{id}")
    public GroupResponseDto getById(@PathVariable Long id) throws GroupNotFoundException {
        return service.getById(id);
    }
    
    @PostMapping("/new")
    public GroupResponseDto create(
            @RequestPart("group") GroupRequestDto entity,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal User user)
            throws GroupAlreadyExistsException, UserNotFoundException {
        return service.create(entity, imageFile, user);
    }

    @DeleteMapping("/{id}")
    public Long delete(@PathVariable Long id) {
        return service.delete(id);
    }

    @PostMapping("/{groupId}/join")
    public GroupMemberDto join(@PathVariable Long groupId, @AuthenticationPrincipal User user) {
        return service.join(groupId, user.getId());
    }
    
    @PostMapping("/{groupId}/leave")
    public Long leave(@PathVariable Long groupId, @AuthenticationPrincipal User user) {
        return service.leave(groupId, user.getId());
    }

    @GetMapping("/possible_groups")
    public List<GroupMinimalResponseDto> getPossibleGroups() {
        return service.getPossibleGroups();
    }

    @PatchMapping("/{groupId}/edit")
    public GroupResponseDto edit(
            @PathVariable Long groupId,
            @RequestPart("group") GroupRequestDto dto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        return service.edit(groupId, dto, imageFile);
    }
    
}
