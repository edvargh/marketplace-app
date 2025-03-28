package com.marketplace.backend.controller;

import com.marketplace.backend.model.User;
import com.marketplace.backend.model.Role;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.security.JwtService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling authentication requests.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")

public class AuthController {

  private final UserRepository userRepo;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authManager;

  /**
   * Register a new user.
   *
   * @param user the user to register
   * @return a JWT token
   */
  @PostMapping("/register")
  public Map<String, String> register(@RequestBody User user) {
    user.setPassword(passwordEncoder.encode(user.getPassword()));
    user.setRole(Role.USER);
    userRepo.save(user);
    String token = jwtService.generateToken(user.getEmail());
    return Map.of("token", token);
  }

  /**
   * Log in a user.
   *
   * @param loginReq the user to log in
   * @return a JWT token
   */
  @PostMapping("/login")
  public Map<String, String> login(@RequestBody User loginReq) {
    authManager.authenticate(
        new UsernamePasswordAuthenticationToken(loginReq.getEmail(), loginReq.getPassword()));
    String token = jwtService.generateToken(loginReq.getEmail());

    return Map.of("token", token);  // ✅ JSON object like: { "token": "..." }
  }
}
