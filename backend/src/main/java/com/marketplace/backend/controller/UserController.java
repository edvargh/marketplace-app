package com.marketplace.backend.controller;

import com.marketplace.backend.dto.UserPublicDto;
import com.marketplace.backend.dto.UserResponseDto;
import com.marketplace.backend.dto.UserUpdateDto;
import com.marketplace.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller for handling user related requests.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
  private static final Logger logger = LoggerFactory.getLogger(UserController.class);

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
   * Get public information about a user.
   *
   * @param id the ID of the user
   * @return the user if found, otherwise a 404 response
   */
  @GetMapping("/{id}")
  public ResponseEntity<UserPublicDto> getUserPublicInfo(@PathVariable Long id) {
    logger.info("Fetching user by ID: {}", id);
    try {
      Optional<UserPublicDto> user = userService.getUserPublicInfo(id);
      if (user.isPresent()) {
        return ResponseEntity.ok(user.get());
      } else {
        logger.warn("User with ID {} not found", id);
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      logger.error("Error fetching user {}: {}", id, e.getMessage(), e);
      throw e;
    }
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

    Long currentUserId = userService.getCurrentUserId();
    if (!id.equals(currentUserId)) {
      logger.warn("Unauthorized attempt to update user ID {}", id);
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    logger.info("Updating user with ID: {}", id);
    dto.setProfilePicture(profilePicture);

    try {
      Optional<UserResponseDto> updatedUser = userService.updateUser(id, dto);
      if (updatedUser.isPresent()) {
        logger.info("User with ID {} updated successfully", id);
        return ResponseEntity.ok(updatedUser.get());
      } else {
        logger.warn("User with ID {} not found for update", id);
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      logger.error("Failed to update user {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Get the current user.
   *
   * @return the current user
   */
  @GetMapping("/me")
  public ResponseEntity<UserResponseDto> getCurrentUser() {
    logger.info("Fetching current authenticated user");
    try {
      UserResponseDto user = userService.getCurrentUser();
      return ResponseEntity.ok(user);
    } catch (Exception e) {
      logger.error("Failed to fetch current user: {}", e.getMessage(), e);
      throw e;
    }
  }
}