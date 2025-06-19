package com.communify.communify.exception;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.NoHandlerFoundException;

import com.communify.communify.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@ResponseBody
@ControllerAdvice
public class GlobalExceptionHandler implements AuthenticationEntryPoint {

    // 400: Bad Request
    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ErrorResponse handleBadRequestException(HttpMessageNotReadableException exception, HttpServletRequest request) {
        return handleException(request, exception);
    }

    // 401: Unauthorized
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authenticationException) throws IOException, ServletException {
        final var errorResponse = handleException(request, authenticationException);
        final var jsonResponse = new ObjectMapper().writeValueAsString(errorResponse);

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(jsonResponse);
    }

    // 404: Not found
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NoHandlerFoundException.class)
    public ErrorResponse handleNotFoundException(NoHandlerFoundException exception, HttpServletRequest request) {
        return handleException(request, exception);
    }

    // 405: Method not allowed
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ErrorResponse handleMethodNotAllowedException(HttpRequestMethodNotSupportedException exception, HttpServletRequest request) {
        return handleException(request, exception);
    }

    // 500: Internal server error
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleInternalServerException(Exception exception, HttpServletRequest request) {
        return handleException(request, exception);
    }

    private ErrorResponse handleException(HttpServletRequest request, Exception exception) {
        final var currentTime = LocalDateTime.now();
        final var formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss.SSS");
        final var formattedTime = currentTime.format(formatter);
        final var url = request.getRequestURI();
        final var message = exception.getMessage();

        return ErrorResponse
                .builder()
                .date(formattedTime)
                .message(message)
                .url(url)
                .build();
    }
}