package com.em.emily.auth.service;

import com.em.emily.auth.dto.UserDTO;

public interface UserService {

    UserDTO createUser(UserDTO userDTO);

    UserDTO getUserByEmail(String email);

    UserDTO updateUser(UserDTO userDTO, String userId);

    void deleteUser(String userId);

    UserDTO getUserById(String userId);

    Iterable<UserDTO> getAllUsers();

    boolean activateUser(String code);
}
