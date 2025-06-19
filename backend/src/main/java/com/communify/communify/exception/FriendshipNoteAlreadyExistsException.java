package com.communify.communify.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class FriendshipNoteAlreadyExistsException extends Exception {
    
    public FriendshipNoteAlreadyExistsException(String message) {
        super(message);
    }
}
