package com.marketplace.backend.service;

import com.marketplace.backend.dto.UserResponseDto;
import com.marketplace.backend.dto.UserUpdateDto;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.UserRepository;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for handling user related business logic.
 */
@Service
public class UserService {

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
    return userRepository.findByEmail(email);
  }

  /**
   * Get all users.
   *
   * @return a list of all users as DTOs
   */
  public List<UserResponseDto> getAllUsers() {
    return userRepository.findAll().stream()
        .map(UserResponseDto::fromEntity)
        .collect(Collectors.toList());
  }

  /**
   * Get a user by ID.
   *
   * @param id the user ID
   * @return an optional user DTO if found
   */
  public Optional<UserResponseDto> getUserById(Long id) {
    return userRepository.findById(id).map(UserResponseDto::fromEntity);
  }

  /**
   * Update a user.
   *
   * @param id the user ID
   * @param dto the updated user data
   * @return an optional updated user DTO if found
   */
  public Optional<UserResponseDto> updateUser(Long id, UserUpdateDto dto) {
    return userRepository.findById(id).map(user -> {
      if (dto.getFullName() != null) user.setFullName(dto.getFullName());
      if (dto.getEmail() != null) user.setEmail(dto.getEmail());
      if (dto.getPassword() != null) user.setPassword(passwordEncoder.encode(dto.getPassword()));
      if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());
      if (dto.getPreferredLanguage() != null) user.setPreferredLanguage(dto.getPreferredLanguage());

      // 🌤 Upload new profile picture if present
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
          throw new RuntimeException("Failed to upload profile picture", e);
        }
      }

      User updated = userRepository.save(user);
      return UserResponseDto.fromEntity(updated);
    });
  }


  /**
   * Get the current user.
   *
   * @return the current user
   */
  public UserResponseDto getCurrentUser() {
    String email = getAuthenticatedEmail();
    User user = userRepository.findByEmail(email).orElseThrow();
    return UserResponseDto.fromEntity(user);
  }

  /**
   * Get the email of the authenticated user.
   *
   * @return the email of the authenticated user
   */
  private String getAuthenticatedEmail() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication.getName(); // Spring extracts username from token
  }

  private String extractPublicIdFromUrl(String imageUrl) {
    try {
      String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
      return filename.substring(0, filename.lastIndexOf(".")); // remove file extension
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid Cloudinary URL: " + imageUrl, e);
    }
  }
}
