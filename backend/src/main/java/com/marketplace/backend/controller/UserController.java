package com.marketplace.backend.controller;

import com.marketplace.backend.model.User;
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
   * @return a list of all users
   */
  @GetMapping
  public List<User> getAllUsers() {
    return userService.getAllUsers();
  }

  /**
   * Get a user by ID.
   *
   * @param id the ID of the user
   * @return the user if found, otherwise a 404 response
   */
  @GetMapping("/{id}")
  public ResponseEntity<User> getUserById(@PathVariable Long id) {
    Optional<User> user = userService.getUserById(id);
    return user.map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }
}