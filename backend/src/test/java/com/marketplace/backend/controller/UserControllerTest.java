package com.marketplace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.backend.dto.UserUpdateDto;
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


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

  @Autowired
  private ObjectMapper objectMapper;

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

  /**
   * Test to update a user.
   *
   * @throws Exception if the request fails
   */
  @Test
  @WithMockUser
  void shouldUpdateUser() throws Exception {
    UserUpdateDto updateDto = new UserUpdateDto();
    updateDto.setFullName("John Updated");
    updateDto.setPreferredLanguage("norwegian");
    updateDto.setPhoneNumber("0000000000");

    mockMvc.perform(MockMvcRequestBuilders.put("/api/users/" + testUser.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updateDto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.fullName", is("John Updated")))
        .andExpect(jsonPath("$.preferredLanguage", is("norwegian")))
        .andExpect(jsonPath("$.phoneNumber", is("0000000000")));
  }

  /**
   * Test to update a non-existing user.
   *
   * @throws Exception if the request fails
   */
  @Test
  @WithMockUser
  void shouldReturn404WhenUpdatingNonExistingUser() throws Exception {
    UserUpdateDto updateDto = new UserUpdateDto();
    updateDto.setFullName("Ghost");

    mockMvc.perform(MockMvcRequestBuilders.put("/api/users/999999")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updateDto)))
        .andExpect(status().isNotFound());
  }
}