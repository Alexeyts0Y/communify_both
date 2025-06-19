package com.communify.communify.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class UserAlredyExistsException extends RuntimeException {
    
    public UserAlredyExistsException(String message) {
        super(message);
    }
}
