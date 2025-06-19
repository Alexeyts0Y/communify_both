package com.communify.communify.filter;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.communify.communify.service.JwtService;
import com.communify.communify.service.UserDetailsServiceImpl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsServiceImpl;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final var authorizationHeader = request.getHeader("Authorization");
        final var prefix = "Bearer ";
        final var prefixLength = prefix.length();
        final var isBearer = authorizationHeader != null && authorizationHeader.startsWith(prefix);

        if (!isBearer) {
            filterChain.doFilter(request, response);
            return;
        }

        final var jwt = authorizationHeader.substring(prefixLength);
        final var isValidate = jwtService.validate(jwt);

        if (isValidate) {
            final var username = jwtService.getUsername(jwt);
            final var user = userDetailsServiceImpl.loadUserByUsername(username);
            final var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        
            final var details = new WebAuthenticationDetailsSource().buildDetails(request);

            authentication.setDetails(details);

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
    
}
