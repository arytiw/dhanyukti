package com.dhan.Stonks.Security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {
    private Long id;
    private String username;

    public UserPrincipal(Long id, String username) {
        this.id = id;
        this.username = username;
    }

    public Long getId() { return id; }
    
    @Override public String getUsername() { return username; }
    @Override public String getPassword() { return null; } // Not needed here
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return Collections.emptyList(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}