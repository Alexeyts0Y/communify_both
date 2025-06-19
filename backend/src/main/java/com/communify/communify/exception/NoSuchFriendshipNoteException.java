package com.communify.communify.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class NoSuchFriendshipNoteException extends Exception{
    public NoSuchFriendshipNoteException(String message) {
        super(message);
    }
}
