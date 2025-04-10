package com.marketplace.backend.controller;

import com.marketplace.backend.dto.LoginRequestDto;
import com.marketplace.backend.dto.RegisterRequestDto;
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
   * @param request the user to register
   * @return a JWT token
   */
  @PostMapping("/register")
  public Map<String, String> register(@RequestBody RegisterRequestDto request) {
    try {
      String token = authService.registerUser(request);
      return Map.of("token", token);
    } catch (Exception e) {
      logger.error("Failed to register user {}: {}", request.getEmail(), e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Log in a user.
   *
   * @param request the user to log in
   * @return a JWT token
   */
  @PostMapping("/login")
  public Map<String, String> login(@RequestBody LoginRequestDto request) {
    try {
      String token = authService.loginUser(request.getEmail(), request.getPassword());
      return Map.of("token", token);
    } catch (Exception e) {
      logger.warn("Login failed for user {}: {}", request.getEmail(), e.getMessage());
      throw e;
    }
  }
}
