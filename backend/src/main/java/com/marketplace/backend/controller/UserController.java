package com.marketplace.backend.controller;

import com.marketplace.backend.dto.UserResponseDto;
import com.marketplace.backend.dto.UserUpdateDto;
import com.marketplace.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controller for handling user related requests.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;

  /**
   * Constructor for UserController.
   *
   * @param userService the service for handling user related requests
   */
  public UserController(UserService userService) {
    this.userService = userService;
  }

  /**
   * Get all users.
   *
   * @return a list of all users (DTOs)
   */
  @GetMapping
  public List<UserResponseDto> getAllUsers() {
    return userService.getAllUsers();
  }

  /**
   * Get a user by ID.
   *
   * @param id the ID of the user
   * @return the user if found, otherwise a 404 response
   */
  @GetMapping("/{id}")
  public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
    Optional<UserResponseDto> user = userService.getUserById(id);
    return user.map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  /**
   * Update a user.
   *
   * @param id  the ID of the user
   * @param dto the updated user data
   * @return a 200 response with the updated user if successful, 404 otherwise
   */
  @PutMapping("/{id}")
  public ResponseEntity<UserResponseDto> updateUser(@PathVariable Long id, @RequestBody UserUpdateDto dto) {
    Optional<UserResponseDto> updatedUser = userService.updateUser(id, dto);
    return updatedUser.map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }
}