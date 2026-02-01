package com.user_micro.User.Service;

import java.util.Collections;

import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Primary
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserService userService;

    public CustomUserDetailsService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.user_micro.User.Model.User u = userService.getUserByUsername(username);
        if (u == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        // Map your user to Spring Security UserDetails. Adjust authorities if needed.
        return User.withUsername(u.getUsername())
                   .password(u.getPassword())
                   .authorities(Collections.emptyList())
                   .build();
    }
}