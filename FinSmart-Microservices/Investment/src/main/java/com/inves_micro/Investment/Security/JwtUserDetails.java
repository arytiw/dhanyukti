package com.inves_micro.Investment.Security;

public class JwtUserDetails {
    private String username;
    private Long userId;

    public JwtUserDetails(String username, Long userId) {
        this.username = username;
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public String toString() {
        return "JwtUserDetails{" +
                "username='" + username + '\'' +
                ", userId=" + userId +
                '}';
    }
}
