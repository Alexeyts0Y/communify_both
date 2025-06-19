package com.communify.communify.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.communify.communify.dto.friend.FriendResponseDto;
import com.communify.communify.dto.user.UserMinimalResponseDto;
import com.communify.communify.entity.Friend;
import com.communify.communify.entity.User;
import com.communify.communify.enums.FriendshipStatus;
import com.communify.communify.exception.FriendshipNoteAlreadyExistsException;
import com.communify.communify.exception.NoSuchFriendshipNoteException;
import com.communify.communify.exception.UserNotFoundException;
import com.communify.communify.repository.FriendRepository;
import com.communify.communify.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FriendService {
    
    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    @Transactional
    public FriendResponseDto sendRequest(Long friendId, User user) 
    throws UserNotFoundException, FriendshipNoteAlreadyExistsException{
        final var friend = userRepository
            .findById(friendId)
            .orElseThrow(() -> new UserNotFoundException("User not found!"));
        
        final var isAlreadyFriendsOrPending = friendRepository
                .existsByUserAndFriendAndStatus(user, friend, FriendshipStatus.ACCEPTED) ||
            friendRepository
                .existsByUserAndFriendAndStatus(user, friend, FriendshipStatus.PENDING) ||
            friendRepository
                .existsByUserAndFriendAndStatus(friend, user, FriendshipStatus.ACCEPTED) ||
            friendRepository
                .existsByUserAndFriendAndStatus(friend, user, FriendshipStatus.PENDING);

        if (isAlreadyFriendsOrPending) {
            throw new FriendshipNoteAlreadyExistsException("Friendship note already exists or is pending.");
        }

        final var newFriendRequest = Friend.builder()
                                           .user(user)
                                           .friend(friend)
                                           .status(FriendshipStatus.PENDING)
                                           .createdAt(LocalDateTime.now())
                                           .build();

        friendRepository.save(newFriendRequest);
        return FriendResponseDto.toDto(newFriendRequest);
    }

    @Transactional
    public FriendResponseDto acceptOrReject(Long requestId, User user, FriendshipStatus status) 
    throws NoSuchFriendshipNoteException {
        final var request = friendRepository
            .findById(requestId)
            .orElseThrow(() -> new NoSuchFriendshipNoteException("No such friendship note"));
        
        switch (status) {
            case FriendshipStatus.ACCEPTED:
                request.setStatus(FriendshipStatus.ACCEPTED);
                break;
        
            case FriendshipStatus.REJECTED:
                request.setStatus(FriendshipStatus.REJECTED);
                break;
            
            default:
                break;
        }
        friendRepository.save(request);
        return FriendResponseDto.toDto(request);
    }

    public List<FriendResponseDto> getAll(Long userId) 
    throws UserNotFoundException, NoSuchFriendshipNoteException{
        final var user = userRepository
            .findById(userId)
            .orElseThrow(() -> new UserNotFoundException(null));
        final var allFriends = friendRepository
            .findAllByUserOrFriendAndStatus(user, user, FriendshipStatus.ACCEPTED)
            .orElseThrow(() -> new NoSuchFriendshipNoteException("No such friendship notes"));
            
        return allFriends
            .stream()
            .map(FriendResponseDto::toDto)
            .toList();
    }

    public List<FriendResponseDto> getSent(User user) 
    throws NoSuchFriendshipNoteException {
        final var sentRequests = friendRepository
            .findAllByUserAndStatus(user, FriendshipStatus.PENDING)
            .orElseThrow(() -> new NoSuchFriendshipNoteException("No such sent friendship notes"));
        
        return sentRequests
            .stream()
            .map(FriendResponseDto::toDto)
            .toList();
    }

    public List<FriendResponseDto> getRecieved(User user) 
    throws NoSuchFriendshipNoteException{
        final var recievedRequests = friendRepository
            .findAllByFriendAndStatus(user, FriendshipStatus.PENDING)
            .orElseThrow(() -> new NoSuchFriendshipNoteException("No such recieved friendship notes"));

        return recievedRequests
            .stream()
            .map(FriendResponseDto::toDto)
            .toList();
    }

    public List<UserMinimalResponseDto> getPossibleFriends() {
        List<User> users = userRepository.findRandomUsers(PageRequest.of(0, 4));
        return users.stream().map(UserMinimalResponseDto::toDto).toList();
    }

    @Transactional
    public Long deleteFriend(Long id) {
        friendRepository.deleteById(id);
        return id;
    }
}
