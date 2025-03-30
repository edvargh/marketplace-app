package com.marketplace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.backend.model.Category;
import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.Role;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.CategoryRepository;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the ItemController.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class ItemControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private ItemRepository itemRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private CategoryRepository categoryRepository;

  private User testUser;
  private Category testCategory;

  /**
   * Set up test data.
   */
  @BeforeEach
  void setUp() {
    itemRepository.deleteAll();
    userRepository.deleteAll();
    categoryRepository.deleteAll();

    User user = new User();
    user.setFullName("John Doe");
    user.setEmail("john@example.com");
    user.setPassword("password123");
    user.setRole(Role.USER);
    user.setPhoneNumber("1234567890");
    testUser = userRepository.save(user);

    testCategory = categoryRepository.save(new Category(null, "Electronics"));

    Item item1 = new Item();
    item1.setSeller(testUser);
    item1.setTitle("Phone");
    item1.setDescription("Smartphone");
    item1.setCategory(testCategory);
    item1.setPrice(300.0);
    item1.setPublishedDate(LocalDateTime.now());
    item1.setLatitude(new BigDecimal("63.4300"));
    item1.setLongitude(new BigDecimal("10.3925"));

    Item item2 = new Item();
    item2.setSeller(testUser);
    item2.setTitle("Tablet");
    item2.setDescription("Android tablet");
    item2.setCategory(testCategory);
    item2.setPrice(200.0);
    item2.setPublishedDate(LocalDateTime.now());
    item2.setLatitude(new BigDecimal("63.4300"));
    item2.setLongitude(new BigDecimal("10.3925"));

    itemRepository.saveAll(List.of(item1, item2));
  }

  /**
   * Test to get all items.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser
  void shouldReturnAllItems() throws Exception {
    mockMvc.perform(get("/api/items/all-items"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON));
  }

  /**
   * Test to get item by id.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser
  void shouldReturnItemById() throws Exception {
    Item item = itemRepository.save(new Item(testUser, "Camera", "DSLR", testCategory, 500.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925")));

    mockMvc.perform(get("/api/items/" + item.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Camera"));
  }

  /**
   * Test to create item.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser
  void shouldCreateItem() throws Exception {
    Item newItem = new Item(testUser, "Headphones", "Noise-cancelling", testCategory, 150.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));

    mockMvc.perform(post("/api/items")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newItem)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Headphones"));
  }
}
