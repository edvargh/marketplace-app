package com.marketplace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test class for the AuthController.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class AuthControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  /**
   * Set up test data.
   */
  @BeforeEach
  void setUp() {
    userRepository.deleteAll();
  }

  /**
   * Test to register a new user.
   *
   * @throws Exception if the test fails
   */
  @Test
  void shouldRegisterUserAndReturnJwt() throws Exception {
    User newUser = new User();
    newUser.setFullName("Alice Example");
    newUser.setEmail("alice@example.com");
    newUser.setPassword("securePass123");

    mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newUser)))
        .andExpect(status().isOk());
  }

  /**
   * Test to log in an existing user.
   *
   * @throws Exception if the test fails
   */
  @Test
  void shouldLoginUserAndReturnJwt() throws Exception {
    // Create and save encoded user
    User user = new User();
    user.setFullName("Bob Example");
    user.setEmail("bob@example.com");
    user.setPassword(passwordEncoder.encode("securePass123"));
    userRepository.save(user);

    // Attempt login
    User loginAttempt = new User();
    loginAttempt.setEmail("bob@example.com");
    loginAttempt.setPassword("securePass123");

    mockMvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(loginAttempt)))
        .andExpect(status().isOk());
  }
}
