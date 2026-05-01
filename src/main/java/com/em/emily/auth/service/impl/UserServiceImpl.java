package com.em.emily.auth.service.impl;

import com.em.emily.auth.dto.UserDTO;
import com.em.emily.auth.entity.Provider;
import com.em.emily.auth.entity.Role;
import com.em.emily.auth.entity.User;
import com.em.emily.auth.exceptions.ResourceNotFoundException;
import com.em.emily.auth.helper.UserHelper;
import com.em.emily.auth.repository.RoleRepository;
import com.em.emily.auth.repository.UserRepository;
import com.em.emily.auth.service.EmailService;
import com.em.emily.auth.service.TotpService;
import com.em.emily.auth.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TotpService totpService;

    @Override
    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        // The validation is now handled in AuthServiceImpl,
        // so we get straight to the mapping and logic.

        // 1. Map DTO to Entity
        User user = modelMapper.map(userDTO, User.class);

        // 2. Security & Defaults
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setProvider(userDTO.getProvider() != null ? userDTO.getProvider() : Provider.LOCAL);
        user.setEnabled(false);

        // Generate the TOTP Secret
        String secret = totpService.generateSecret();
        user.setTotpSecret(secret);

        // 3. Assign Default Role
        Role defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new ResourceNotFoundException("Default Role 'ROLE_USER' not found"));
        user.setRoles(Collections.singleton(defaultRole));

        // 4. Persistence
        User savedUser = userRepository.save(user);

        // 5. Generate TOTP Code for Email
        String code = totpService.generateCode(secret);

        // 6. Email Notification
        String subject = "Activate your BaseLink Account";
        String body = """
                Welcome to BaseLink!
                
                Please use the following 6-digit code to activate your account:
                
                %s
                
                This code is valid for 10 minutes.
                """.formatted(code);
        emailService.sendEmail(savedUser.getEmail(), subject, body);

        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    @Transactional
    public boolean activateUser(String email, String code) {
        // 1. Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.isEnabled()) {
            return true;
        }

        // 2. Verify TOTP code
        if (user.getTotpSecret() == null) {
            throw new RuntimeException("User has no TOTP secret configured");
        }

        boolean isValid = totpService.verifyCode(user.getTotpSecret(), code, 600);
        if (!isValid) {
            throw new RuntimeException("Invalid or expired activation code");
        }

        user.setEnabled(true);
        userRepository.save(user);

        log.info("User with email {} has been successfully activated.", user.getEmail());
        return true;
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    @Transactional
    public UserDTO updateUser(UserDTO userDTO, String userId) {
        UUID uId = UserHelper.parseUUID(userId);
        User existingUser = userRepository.findById(uId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (userDTO.getName() != null) existingUser.setName(userDTO.getName());
        if (userDTO.getImage() != null) existingUser.setImage(userDTO.getImage());
        if (userDTO.getProvider() != null) existingUser.setProvider(userDTO.getProvider());

        if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        }



        // FIX: Changed 'user' to 'existingUser'
        if (userDTO.getEnabled() != null) {
            existingUser.setEnabled(userDTO.getEnabled());
        }

        User updatedUser = userRepository.save(existingUser);
        return modelMapper.map(updatedUser, UserDTO.class);
    }

    @Override
    public void deleteUser(String userId) {
        UUID uId = UserHelper.parseUUID(userId);
        if (!userRepository.existsById(uId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        userRepository.deleteById(uId);
    }

    @Override
    public UserDTO getUserById(String userId) {
        UUID uId = UserHelper.parseUUID(userId);
        User user = userRepository.findById(uId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    public Iterable<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .collect(Collectors.toList());
    }
}