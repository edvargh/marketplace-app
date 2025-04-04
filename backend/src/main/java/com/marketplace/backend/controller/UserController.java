package com.marketplace.backend.controller;

import com.marketplace.backend.dto.UserResponseDto;
import com.marketplace.backend.dto.UserUpdateDto;
import com.marketplace.backend.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.marketplace.backend.security.JwtService;

import java.util.List;
import java.util.Optional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller for handling user related requests.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

  private final UserService userService;
  private final JwtService jwtService;

  /**
   * Constructor for UserController.
   *
   * @param userService the service for handling user related requests
   */
  public UserController(UserService userService) {
    this.userService = userService;
    this.jwtService = new JwtService();
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
  @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<UserResponseDto> updateUser(
      @PathVariable Long id,
      @RequestPart("dto") UserUpdateDto dto,
      @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture
  ) {
    dto.setProfilePicture(profilePicture);
    Optional<UserResponseDto> updatedUser = userService.updateUser(id, dto);
    return updatedUser.map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }


  /**
   * Get the current user.
   *
   * @return the current user
   */
  @GetMapping("/me")
  public ResponseEntity<UserResponseDto> getCurrentUser() {
    UserResponseDto user = userService.getCurrentUser();
    return ResponseEntity.ok(user);
  }

}