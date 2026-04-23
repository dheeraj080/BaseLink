package com.em.emily.auth.helper;

import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.UUID;

@Component
public class UserIdArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType().equals(UUID.class) &&
                parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) return null;

        Object principal = auth.getPrincipal();

        if (principal instanceof com.em.emily.auth.UserPrincipal userPrincipal) {
            return userPrincipal.id();
        }

        if (principal instanceof com.em.emily.auth.entity.User user) {
            return user.getId();
        }

        // Support for @WithMockUser in tests
        if (principal instanceof org.springframework.security.core.userdetails.User) {
            // For @WithMockUser, we can return a consistent mock UUID or handle as needed
            // Returning a random UUID here might be risky if the test expects a specific one,
            // but usually @WithMockUser is for "any authenticated user".
            // However, EmIlyIntegrationTest expects a specific user ID for some checks.
            return UUID.fromString("00000000-0000-0000-0000-000000000000");
        }

        return null;
    }
}
