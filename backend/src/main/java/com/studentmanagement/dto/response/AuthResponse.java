package com.studentmanagement.dto.response;

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private UserResponse user;
    private StudentProfileResponse profile;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String refreshToken, UserResponse user, StudentProfileResponse profile) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
        this.profile = profile;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }

    public StudentProfileResponse getProfile() { return profile; }
    public void setProfile(StudentProfileResponse profile) { this.profile = profile; }
}

