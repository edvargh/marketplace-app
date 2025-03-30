package com.marketplace.backend.service;

import com.marketplace.backend.dto.UserResponseDto;
import com.marketplace.backend.dto.UserUpdateDto;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for handling user related business logic.
 */
@Service
public class UserService {

  private final UserRepository userRepository;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  /**
   * Constructor for UserService.
   *
   * @param userRepository the repository for user data
   */
  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
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
      if (dto.getProfilePicture() != null) user.setProfilePicture(dto.getProfilePicture());
      if (dto.getPreferredLanguage() != null) user.setPreferredLanguage(dto.getPreferredLanguage());

      User updated = userRepository.save(user);
      return UserResponseDto.fromEntity(updated);
    });
  }
}
