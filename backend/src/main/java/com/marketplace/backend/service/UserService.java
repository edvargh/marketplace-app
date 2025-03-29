package com.marketplace.backend.service;

import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for handling user related business logic.
 */
@Service
public class UserService {

  private final UserRepository userRepository;

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
   * @return a list of all users
   */
  public List<User> getAllUsers() {
    return userRepository.findAll();
  }

  /**
   * Get a user by ID.
   *
   * @param id the user ID
   * @return an optional user if found
   */
  public Optional<User> getUserById(Long id) {
    return userRepository.findById(id);
  }
}
