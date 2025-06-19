package com.communify.communify.service;

import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.communify.communify.enums.GroupRole;
import com.communify.communify.entity.User;
import com.communify.communify.repository.UserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Service
@RequiredArgsConstructor
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private int expiration;
    
    private final UserRepository userRepository;

    public String getUsername(String token) {
        return Jwts.parser()
                   .verifyWith(key())
                   .build()
                   .parseSignedClaims(token)
                   .getPayload()
                   .getSubject();
    }

    public String generateToken(User user) {
        Set<String> roles = user.getGroupMemberships()
                                .stream()
                                .map(member -> "GROUP_" + 
                                    member.getGroup().getId() + "_" + 
                                    member.getRole().name()
                                )
                                .collect(Collectors.toSet());

        user.getCreatedGroups().forEach(group -> {
            boolean isAdminInGroup = user.getGroupMemberships()
                                         .stream()
                                         .anyMatch(m -> m.getGroup().equals(group) && 
                                                        m.getRole() == GroupRole.ADMIN);
        
            if (!isAdminInGroup) {
                roles.add("GROUP_" + group.getId() + "_ADMIN");
            }
        });

        final var username = user.getUsername();
        final var id = user.getId();
        final var email = user.getEmail();
        final var exceptionTime = new Date(System.currentTimeMillis() + expiration);

        return Jwts
                .builder()
                .subject(username)
                .claim("id", id)
                .claim("email", email)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(exceptionTime)
                .signWith(key())
                .compact();
    }

    public boolean validate(String token) {
        try {
            Jwts.parser()
                .verifyWith(key())
                .build()
                .parse(token);
    
            return true;
        }

        catch (Exception e) {
            return false;
        }
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}
