package com.communify.communify.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.communify.communify.dto.friend.FriendResponseDto;
import com.communify.communify.dto.user.UserMinimalResponseDto;
import com.communify.communify.dto.user.UserRequestDto;
import com.communify.communify.dto.user.UserResponseDto;
import com.communify.communify.entity.User;
import com.communify.communify.enums.FriendshipStatus;
import com.communify.communify.exception.FriendshipNoteAlreadyExistsException;
import com.communify.communify.exception.NoSuchFriendshipNoteException;
import com.communify.communify.exception.UserNotFoundException;
import com.communify.communify.service.FriendService;
import com.communify.communify.service.UserService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FriendService friendService;

    @GetMapping("/{id}")
    public UserResponseDto getUserById(@PathVariable Long id) 
    throws UserNotFoundException {
        return userService.getById(id);
    }

    @GetMapping("/me")
    public UserResponseDto getMyProfile(@AuthenticationPrincipal User user) {
        return userService.getById(user.getId());
    }
    
    @PatchMapping("/{id}")
    @PreAuthorize("#id == principal.id")
    public UserResponseDto updateUser(
        @PathVariable Long id, 
        @RequestPart("user") UserRequestDto entity,
        @RequestPart(value = "avatar", required = false) MultipartFile avatar) 
    throws UserNotFoundException {
        return userService.update(id, entity, avatar);
    }
    
    @DeleteMapping("/{id}")
    public Long deleteUser(@PathVariable Long id) {
        return userService.delete(id);
    }

    @GetMapping("/{userId}/friends")
    public List<FriendResponseDto> getAll(@PathVariable Long userId) 
    throws UserNotFoundException, NoSuchFriendshipNoteException {
        return friendService.getAll(userId);
    }

    @PostMapping("/{friendId}/send_friend_request")
    public FriendResponseDto sendRequest(@PathVariable Long friendId, @AuthenticationPrincipal User user) 
    throws UserNotFoundException, FriendshipNoteAlreadyExistsException {
        return friendService.sendRequest(friendId, user);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/friends/requests/sent")
    public List<FriendResponseDto> getSent(@AuthenticationPrincipal User user) 
    throws NoSuchFriendshipNoteException {
        return friendService.getSent(user);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/possible_friends")
    public List<UserMinimalResponseDto> getPossibleFriends() {
        return friendService.getPossibleFriends();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/friends")
    public List<FriendResponseDto> getMyFriends(@AuthenticationPrincipal User user) 
    throws UserNotFoundException, NoSuchFriendshipNoteException {
        return friendService.getAll(user.getId());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/friends/requests/recieved")
    public List<FriendResponseDto> getRecieved(@AuthenticationPrincipal User user) 
    throws NoSuchFriendshipNoteException {
        return friendService.getRecieved(user);
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/me/friends/requests/{requestId}/accept")
    public FriendResponseDto accept(@PathVariable Long requestId, @AuthenticationPrincipal User user) 
    throws NoSuchFriendshipNoteException {
        return friendService.acceptOrReject(requestId, user, FriendshipStatus.ACCEPTED);
    }  

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/me/friends/requests/{requestId}/reject")
    public FriendResponseDto reject(@PathVariable Long requestId, @AuthenticationPrincipal User user) 
    throws NoSuchFriendshipNoteException {
        return friendService.acceptOrReject(requestId, user, FriendshipStatus.REJECTED);
    }

    @DeleteMapping("/me/friends/delete/{id}")
    public Long deleteFriend(@PathVariable Long id) {
        return friendService.deleteFriend(id);
    }
}