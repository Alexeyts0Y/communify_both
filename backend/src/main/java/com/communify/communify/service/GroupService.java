package com.communify.communify.service;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.communify.communify.dto.group.GroupMemberDto;
import com.communify.communify.dto.group.GroupMinimalResponseDto;
import com.communify.communify.dto.group.GroupRequestDto;
import com.communify.communify.dto.group.GroupResponseDto;
import com.communify.communify.entity.Group;
import com.communify.communify.entity.GroupMember;
import com.communify.communify.entity.User;
import com.communify.communify.enums.GroupRole;
import com.communify.communify.exception.GroupAlreadyExistsException;
import com.communify.communify.exception.GroupNotFoundException;
import com.communify.communify.exception.UserNotFoundException;
import com.communify.communify.repository.GroupMemberRepository;
import com.communify.communify.repository.GroupRepository;
import com.communify.communify.repository.UserRepository;

import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final FileService fileService;

    private static final String GROUP_IMAGE_FOLDER = "groupImage";

    public GroupResponseDto getById(Long id) throws GroupNotFoundException {
        final var group = groupRepository.findById(id)
            .orElseThrow(() -> new GroupNotFoundException("There`s no group with given id"));
        return GroupResponseDto.toDto(group);
    }

    @Transactional
    public GroupResponseDto create(GroupRequestDto dto, MultipartFile imageFile, User user)
    throws GroupAlreadyExistsException, UserNotFoundException {
        if (groupRepository.existsByName(dto.getName())) {
            throw new GroupAlreadyExistsException("Group with that name already exists");
        }

        final var group = GroupRequestDto.toEntity(dto);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String objectName = fileService.uploadFile(imageFile, GROUP_IMAGE_FOLDER);
                group.setImageUrl(fileService.getFileUrl(objectName));
            } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
                throw new RuntimeException("Не удалось загрузить изображение группы.");
            }
        }

        group.setCreator(user);
        group.setCreatedAt(LocalDateTime.now());

        final var savedGroup = groupRepository.save(group);

        final var groupMembership = new GroupMember();
        groupMembership.setGroup(savedGroup);
        groupMembership.setUser(user);
        groupMembership.setRole(GroupRole.ADMIN);
        groupMembership.setCreatedAt(LocalDateTime.now());
        groupMemberRepository.save(groupMembership);

        return GroupResponseDto.toDto(savedGroup);
    }

    @Transactional
    public GroupResponseDto edit(Long groupId, GroupRequestDto dto, MultipartFile imageFile) {
        final var group = groupRepository.findById(groupId)
            .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        if (dto.getName() != null) {
            group.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            group.setDescription(dto.getDescription());
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String objectName = fileService.uploadFile(imageFile, GROUP_IMAGE_FOLDER);
                group.setImageUrl(fileService.getFileUrl(objectName));
            } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
                throw new RuntimeException("Не удалось загрузить изображение группы.");
            }
        } else if (dto.getImageUrl() != null) {
            group.setImageUrl(dto.getImageUrl());
        }

        groupRepository.save(group);

        return GroupResponseDto.toDto(group);
    }

    @Transactional
    public GroupMemberDto join(Long groupId, Long userId)
            throws UserNotFoundException, GroupNotFoundException, IllegalStateException{
        final var user = userRepository
            .findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        final var group = groupRepository
            .findById(groupId)
            .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        if (groupMemberRepository.existsByUserAndGroup(user, group)) {
            throw new IllegalStateException("User is already a member of this group");
        }

        final var groupMember = new GroupMember();

        groupMember.setUser(user);
        groupMember.setGroup(group);
        groupMember.setCreatedAt(LocalDateTime.now());
        groupMember.setRole(GroupRole.MEMBER);

        groupMemberRepository.save(groupMember);
        return GroupMemberDto.toDto(groupMember);
    }

    @Transactional
    public Long leave(Long groupId, Long userId)
            throws IllegalStateException, GroupNotFoundException {
        final var user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found!"));
        final var group = groupRepository.findById(groupId)
            .orElseThrow(() -> new GroupNotFoundException("Group not found!"));

        if (!groupMemberRepository.existsByUserAndGroup(user, group)) {
            throw new IllegalStateException("User is not member of this group!");
        }

        groupMemberRepository.deleteByUserAndGroup(user, group);
        return groupId;
    }

    public List<GroupMinimalResponseDto> getPossibleGroups() {
        List<Group> groups = groupRepository.findRandomGroups(PageRequest.of(0, 4));
        return groups.stream().map(GroupMinimalResponseDto::toDto).toList();
    }

    @Transactional
    public Long delete(Long id) {
        groupRepository.deleteById(id);
        return id;
    }

}