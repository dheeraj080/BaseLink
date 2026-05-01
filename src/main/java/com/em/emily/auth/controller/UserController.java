package com.em.emily.auth.controller;

import com.em.emily.auth.dto.UserDTO;
import com.em.emily.auth.entity.User;
import com.em.emily.auth.repository.UserRepository;
import com.em.emily.auth.service.TotpService;
import com.em.emily.auth.service.UserService;
import lombok.AllArgsConstructor;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@AllArgsConstructor
public class UserController {

    private final UserService userService;
    private final TotpService totpService;
    private final UserRepository userRepository;

    @PostMapping("/me/mfa/setup")
    public ResponseEntity<Map<String, String>> setupMfa(java.security.Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate secret if not exists
        if (user.getTotpSecret() == null) {
            user.setTotpSecret(totpService.generateSecret());
            userRepository.save(user);
        }

        String qrCodeUri = totpService.getQrCodeUri(user.getTotpSecret(), user.getEmail());
        
        return ResponseEntity.ok(Map.of(
                "secret", user.getTotpSecret(),
                "qrCodeUri", qrCodeUri
        ));
    }

    @PostMapping("/me/mfa/confirm")
    public ResponseEntity<Map<String, String>> confirmMfa(@RequestBody Map<String, String> request, java.security.Principal principal) {
        String code = request.get("code");
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (totpService.verifyCode(user.getTotpSecret(), code)) {
            user.setMfaEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "MFA enabled successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid code"));
        }
    }

    @PostMapping("/me/mfa/disable")
    public ResponseEntity<Map<String, String>> disableMfa(java.security.Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setMfaEnabled(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "MFA disabled successfully"));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDTO));
    }

    @GetMapping
    public ResponseEntity<Iterable<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // New Endpoint: Get User by ID
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDTO> updateUser(@RequestBody UserDTO userDTO, @PathVariable String userId) {
        return ResponseEntity.ok(userService.updateUser(userDTO, userId));
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // Returns 204 No Content instead of 200 OK
    public void deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
    }
}