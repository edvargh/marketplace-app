package com.marketplace.backend.controller;

import com.marketplace.backend.model.User;
import com.marketplace.backend.service.AuthService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling authentication requests.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")

public class AuthController {
  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

  private final AuthService authService;

  /**
   * Register a new user.
   *
   * @param user the user to register
   * @return a JWT token
   */
  @PostMapping("/register")
  public Map<String, String> register(@RequestBody User user) {
    try {
      String token = authService.registerUser(user);
      return Map.of("token", token);
    } catch (Exception e) {
      logger.error("Failed to register user {}: {}", user.getEmail(), e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Log in a user.
   *
   * @param loginReq the user to log in
   * @return a JWT token
   */
  @PostMapping("/login")
  public Map<String, String> login(@RequestBody User loginReq) {
    try {
      String token = authService.loginUser(loginReq.getEmail(), loginReq.getPassword());
      return Map.of("token", token);
    } catch (Exception e) {
      logger.warn("Login failed for user {}: {}", loginReq.getEmail(), e.getMessage());
      throw e;
    }
  }
}
