package com.marketplace.backend.service;

import com.marketplace.backend.model.User;
import com.marketplace.backend.model.Role;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service for handling authentication-related operations.
 */
@Service
@RequiredArgsConstructor
public class AuthService {
  private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;

  /**
   * Registers a new user and generates a JWT token.
   *
   * @param user the user to register
   * @return a JWT token
   */
  public String registerUser(User user) {
    logger.info("Registering new user with email: {}", user.getEmail());

    user.setPassword(passwordEncoder.encode(user.getPassword()));
    user.setRole(Role.USER);
    userRepository.save(user);

    String token = jwtService.generateToken(user.getEmail());
    logger.info("User registered successfully: {}", user.getEmail());

    return token;
  }

  /**
   * Authenticates a user and generates a JWT token.
   *
   * @param email the user's email
   * @param password the user's password
   * @return a JWT token
   */
  public String loginUser(String email, String password) {
    logger.info("Authenticating user: {}", email);

    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(email, password)
    );

    String token = jwtService.generateToken(email);
    logger.info("User authenticated successfully: {}", email);

    return token;
  }
}