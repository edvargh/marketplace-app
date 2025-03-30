package com.marketplace.backend.controller;

import com.marketplace.backend.model.Role;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the UserController.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class UserControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ItemRepository itemRepository;

  private User testUser;

  /**
   * Set up test data.
   */
  @BeforeEach
  void setUp() {
    itemRepository.deleteAll();
    userRepository.deleteAll();

    User user1 = new User(
        "John Doe",
        "john@example.com",
        "password123",
        Role.USER,
        "1234567890",
        "https://example.com/john-profile.jpg",
        "english"
    );

    User user2 = new User(
        "Jane Smith",
        "jane@example.com",
        "password456",
        Role.USER,
        "9876543210",
        "https://example.com/jane-profile.jpg",
        "norwegian"
    );

    testUser = userRepository.save(user1);
    userRepository.save(user2);
  }


  /**
   * Test to get all users.
   *
   * @throws Exception if the request fails
   */
  @Test
  @WithMockUser
  void shouldReturnAllUsers() throws Exception {
    mockMvc.perform(get("/api/users"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.length()").value(2));
  }

  /**
   * Test to get user by ID.
   *
   * @throws Exception if the request fails
   */
  @Test
  @WithMockUser
  void shouldReturnUserById() throws Exception {
    mockMvc.perform(get("/api/users/" + testUser.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("john@example.com"));
  }
}