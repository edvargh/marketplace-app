package com.marketplace.backend.service;

import com.marketplace.backend.dto.UserPublicDto;
import com.marketplace.backend.dto.UserResponseDto;
import com.marketplace.backend.dto.UserUpdateDto;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.UserRepository;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for handling user related business logic.
 */
@Service
public class UserService {
  private static final Logger logger = LoggerFactory.getLogger(UserService.class);

  private final UserRepository userRepository;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
  private final CloudinaryService cloudinaryService;

  /**
   * Constructor for UserService.
   *
   * @param userRepository the repository for user data
   */
  public UserService(UserRepository userRepository, CloudinaryService cloudinaryService) {
    this.userRepository = userRepository;
    this.cloudinaryService = cloudinaryService;
  }

  /**
   * Find a user by email.
   *
   * @param email the email of the user
   * @return an optional user if found
   */
  public Optional<User> findByEmail(String email) {
    logger.debug("Finding user by email: {}", email);
    return userRepository.findByEmail(email);
  }

  /**
   * Get public information about a user.
   *
   * @param id the user ID
   * @return an optional user DTO if found
   */
  public Optional<UserPublicDto> getUserPublicInfo(Long id) {
    logger.info("Fetching user by ID: {}", id);
    try {
      return userRepository.findById(id).map(UserPublicDto::fromEntity);
    } catch (Exception e) {
      logger.error("Error fetching user with ID {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Update a user.
   *
   * @param id the user ID
   * @param dto the updated user data
   * @return an optional updated user DTO if found
   */
  public Optional<UserResponseDto> updateUser(Long id, UserUpdateDto dto) {
    logger.info("Updating user with ID: {}", id);
    try {
      return userRepository.findById(id).map(user -> {
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
          if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
          }
          user.setEmail(dto.getEmail());
        }
        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().equals(user.getPhoneNumber())) {
          if (userRepository.existsByPhoneNumber(dto.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already in use");
          }
          user.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPassword() != null) user.setPassword(passwordEncoder.encode(dto.getPassword()));
        if (dto.getPreferredLanguage() != null) user.setPreferredLanguage(dto.getPreferredLanguage());

        MultipartFile picture = dto.getProfilePicture();
        if (picture != null && !picture.isEmpty()) {
          try {
            if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
              String publicId = extractPublicIdFromUrl(user.getProfilePicture());
              cloudinaryService.deleteImage(publicId);
            }
            String url = cloudinaryService.uploadImage(user.getId(), picture);
            user.setProfilePicture(url);
          } catch (IOException e) {
            logger.error("Failed to upload profile picture for user {}: {}", user.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to upload profile picture", e);
          }
        }

        User updated = userRepository.save(user);
        logger.info("User with ID {} updated successfully", updated.getId());
        return UserResponseDto.fromEntity(updated);
      });
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
  public UserResponseDto getCurrentUser() {
    String email = getAuthenticatedEmail();
    logger.info("Fetching current user with email: {}", email);
    try {
      User user = userRepository.findByEmail(email).orElseThrow();
      logger.debug("Found current user: {}", user.getId());
      return UserResponseDto.fromEntity(user);
    } catch (Exception e) {
      logger.error("Failed to fetch current user {}: {}", email, e.getMessage(), e);
      throw e;
    }
  }

  public Long getCurrentUserId() {
    return userRepository.findByEmail(getAuthenticatedEmail())
        .orElseThrow()
        .getId();
  }

  /**
   * Get the email of the authenticated user.
   *
   * @return the email of the authenticated user
   */
  private String getAuthenticatedEmail() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication.getName();
  }

  private String extractPublicIdFromUrl(String imageUrl) {
    try {
      String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
      return filename.substring(0, filename.lastIndexOf("."));
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid Cloudinary URL: " + imageUrl, e);
    }
  }
}
