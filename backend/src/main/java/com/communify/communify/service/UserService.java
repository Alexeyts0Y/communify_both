package com.communify.communify.service;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.communify.communify.dto.user.UserRequestDto;
import com.communify.communify.dto.user.UserResponseDto;
import com.communify.communify.entity.User;
import com.communify.communify.exception.UserNotFoundException;
import com.communify.communify.repository.UserRepository;

import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final FileService fileService;

    private static final String USER_AVATAR_FOLDER = "userAvatar";

    public UserResponseDto getById(Long id) throws UserNotFoundException{
        User user = repository
            .findById(id)
            .orElseThrow(() -> new UserNotFoundException("Пользователь с таким id не найден!"));
        return UserResponseDto.toDto(user);
    }

    @Transactional
    public UserResponseDto update(Long id, UserRequestDto userRequestDto, MultipartFile avatar) throws UserNotFoundException {
        User user = repository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Пользователь с таким id не найден!"));
        if (avatar != null) {
            uploadAvatar(user, avatar);
        }
        if (userRequestDto.getUsername() != null) {
            user.setUsername(userRequestDto.getUsername());
        }
        if (userRequestDto.getEmail() != null) {
            user.setEmail(userRequestDto.getEmail());
        }
        if (userRequestDto.getFirstName() != null) {
            user.setFirstName(userRequestDto.getFirstName());
        }
        if (userRequestDto.getLastName() != null) {
            user.setLastName(userRequestDto.getLastName());
        }
        if (userRequestDto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));
        }

        repository.save(user);

        return UserResponseDto.toDto(user);
    }

    @Transactional
    private UserResponseDto uploadAvatar(User user, MultipartFile avatarFile) {
        if (avatarFile == null || avatarFile.isEmpty()) {
            throw new IllegalArgumentException("Файл не может быть пустым");
        }

        try {
            String objectName = fileService.uploadFile(avatarFile, USER_AVATAR_FOLDER);
            String avatarUrl = fileService.getFileUrl(objectName);

            user.setAvatarUrl(avatarUrl);
            repository.save(user);

            return UserResponseDto.toDto(user);
        } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Ошибка загрузки картинки профиля: " + e.getMessage(), e);
        }
    }

    @Transactional
    @CacheEvict(value = "userRecommendations", key = "#id")
    public Long delete(Long id) {
        repository.deleteById(id);
        return id;
    }
}