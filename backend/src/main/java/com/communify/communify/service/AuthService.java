package com.communify.communify.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.communify.communify.dto.Token;
import com.communify.communify.dto.user.UserLoginDto;
import com.communify.communify.dto.user.UserRequestDto;
import com.communify.communify.dto.user.UserResponseDto;
import com.communify.communify.entity.User;
import com.communify.communify.exception.UserAlredyExistsException;
import com.communify.communify.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthenticationManager manager;

    public UserResponseDto register(UserRequestDto dto) {
        final var username = dto.getUsername();
        final var email = dto.getEmail();
        final var password = dto.getPassword();
        final var firstName = dto.getFirstName();
        final var lastName = dto.getLastName();

        boolean isAlreadyExists = userRepository.existsByUsername(username);
        
        if (isAlreadyExists) {
            throw new UserAlredyExistsException("User already exists!");
        }
        
        final var passwordHash = passwordEncoder.encode(password);

        final var user = User.builder()
                             .username(username)
                             .email(email)
                             .password(passwordHash)
                             .firstName(firstName)
                             .lastName(lastName)
                             .build();
        userRepository.save(user);

        return UserResponseDto.toDto(user);
    }

    public Token login(UserLoginDto dto) {
        final var username = dto.getUsername();
        final var password = dto.getPassword();
        final var usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(username, password);
        final var authentication = manager.authenticate(usernamePasswordAuthenticationToken);
        final var jwt = jwtService.generateToken((User) authentication.getPrincipal());

        return Token.builder()
                    .token(jwt)
                    .build();
    }
}
