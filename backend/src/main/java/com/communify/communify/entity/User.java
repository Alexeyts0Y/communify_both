package com.communify.communify.entity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Post> posts;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Friend> sentFriendRequests;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "friend")
    private List<Friend> recievedFriendRequests;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user", fetch = FetchType.EAGER)
    private List<GroupMember> groupMemberships;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Like> postedLikes;

    @OneToMany(cascade = CascadeType.ALL ,mappedBy = "creator", fetch = FetchType.EAGER)
    private List<Group> createdGroups;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();

        this.groupMemberships.forEach(member -> {
            String role = "GROUP_" + member.getGroup().getId() + "_" + member.getRole().name();
            authorities.add(new SimpleGrantedAuthority(role));
        });

        this.createdGroups.forEach(group -> {
            String adminRole = "GROUP_" + group.getId() + "_ADMIN";
            authorities.add(new SimpleGrantedAuthority(adminRole));
        });
        
        return authorities;
    }

}