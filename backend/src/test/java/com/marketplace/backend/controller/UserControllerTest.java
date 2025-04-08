package com.marketplace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.backend.BackendApplication;
import com.marketplace.backend.controller.config.MockCloudinaryConfig;
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
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


/**
 * Test class for the UserController.
 */
@SpringBootTest(classes = {
    BackendApplication.class,
    MockCloudinaryConfig.class
})
@Transactional
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Import(MockCloudinaryConfig.class)
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
    userRepository.findAll().forEach(user -> {
      user.getFavoriteItems().clear();
      userRepository.save(user);
    });

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
  void shouldUpdateUserWithDataAndProfilePicture() throws Exception {
    UserUpdateDto updateDto = new UserUpdateDto();
    updateDto.setFullName("John Updated");
    updateDto.setPreferredLanguage("norwegian");
    updateDto.setPhoneNumber("0000000000");

    MockMultipartFile dtoPart = new MockMultipartFile(
        "dto", "", "application/json", objectMapper.writeValueAsBytes(updateDto)
    );

    MockMultipartFile image = new MockMultipartFile(
        "profilePicture", "avatar.jpg", "image/jpeg", "dummy image content".getBytes()
    );

    mockMvc.perform(MockMvcRequestBuilders.multipart("/api/users/" + testUser.getId())
            .file(dtoPart)
            .file(image)
            .with(request -> { request.setMethod("PUT"); return request; })
            .contentType(MediaType.MULTIPART_FORM_DATA))
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

    MockMultipartFile dtoPart = new MockMultipartFile(
        "dto", "", "application/json", objectMapper.writeValueAsBytes(updateDto)
    );

    mockMvc.perform(MockMvcRequestBuilders.multipart("/api/users/999999")
            .file(dtoPart)
            .with(req -> { req.setMethod("PUT"); return req; })
            .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isNotFound());
  }

  /**
   * Test to return current user.
   *
   * @throws Exception if the request fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldReturnCurrentUser() throws Exception {
    mockMvc.perform(get("/api/users/me"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.email", is("john@example.com")))
        .andExpect(jsonPath("$.fullName", is("John Doe")))
        .andExpect(jsonPath("$.phoneNumber", is("1234567890")))
        .andExpect(jsonPath("$.preferredLanguage", is("english")));
  }
}