package com.em.emily.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TokenResponse(
        String accessToken,
        String refreshToken,
        Long expiresIn,
        String tokenType,
        UserDTO user,
        Boolean mfaRequired,
        String mfaToken
) {
    public static TokenResponse of(String accessToken, String refreshToken, long expiresIn, UserDTO user) {
        return new TokenResponse(accessToken, refreshToken, expiresIn, "Bearer", user, false, null);
    }

    public static TokenResponse mfaRequired(String mfaToken) {
        return new TokenResponse(null, null, null, null, null, true, mfaToken);
    }
}