package com.marketplace.backend.controller;

import com.marketplace.backend.model.*;
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for ItemViewController.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(locations = "classpath:application-test.properties")
class ItemViewControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ItemRepository itemRepository;

  @Autowired
  private CategoryRepository categoryRepository;

  private User testUser;
  private Item testItem;
  private Category category;


  @BeforeEach
  void setUp() {
    itemRepository.deleteAll();
    userRepository.deleteAll();
    categoryRepository.deleteAll();

    testUser = new User("John", "john@example.com", "password", Role.USER, "12345678", null, "english");
    testUser = userRepository.save(testUser);

    category = new Category(null, "Electronics");
    category = categoryRepository.save(category);

    testItem = new Item(testUser, "Phone", "Smartphone", category, 500.0,
        LocalDateTime.now(), new BigDecimal("63.43"), new BigDecimal("10.39"));
    testItem.setStatus(ItemStatus.FOR_SALE);
    testItem = itemRepository.save(testItem);
  }

  /**
   * Test logging a view for an item.
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldLogItemView() throws Exception {
    mockMvc.perform(post("/api/items/" + testItem.getId() + "/view"))
        .andExpect(status().isOk());
  }

  /**
   * Test getting recommended items.
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldReturnRecommendedItems() throws Exception {
    User otherUser = new User("Jacob", "jacob@example.com", "password", Role.USER,
        "9876543210", null, "english");
    otherUser = userRepository.save(otherUser);

    Item otherItem = new Item(otherUser, "Another Phone", "Nice one", category, 400.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    otherItem.setStatus(ItemStatus.FOR_SALE);
    itemRepository.save(otherItem);

    mockMvc.perform(post("/api/items/" + testItem.getId() + "/view"))
        .andExpect(status().isOk());

    mockMvc.perform(get("/api/items/recommended"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].title").value("Another Phone"));
  }
}
