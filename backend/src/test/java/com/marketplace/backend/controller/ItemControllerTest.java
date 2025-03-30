package com.marketplace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.backend.dto.ItemCreateDto;
import com.marketplace.backend.dto.ItemUpdateDto;
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

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

    testUser = new User("John Doe", "john@example.com", "password123", Role.USER,
        "1234567890", null, "english");
    testUser = userRepository.save(testUser);

    testCategory = categoryRepository.save(new Category(null, "Electronics"));

    Item item1 = new Item(testUser, "Phone", "Smartphone", testCategory, 300.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    item1.setStatus(ItemStatus.FOR_SALE);

    Item item2 = new Item(testUser, "Tablet", "Android tablet", testCategory, 200.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    item2.setStatus(ItemStatus.FOR_SALE);

    itemRepository.saveAll(List.of(item1, item2));
  }

  @Test
  @WithMockUser(username = "john@example.com")
  void shouldReturnAllItems() throws Exception {
    mockMvc.perform(get("/api/items/all-items"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON));
  }

  @Test
  @WithMockUser(username = "john@example.com")
  void shouldReturnItemById() throws Exception {
    Item item = new Item(testUser, "Camera", "DSLR", testCategory, 500.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    item.setStatus(ItemStatus.FOR_SALE);
    item = itemRepository.save(item);

    mockMvc.perform(get("/api/items/" + item.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Camera"));
  }

  @Test
  @WithMockUser(username = "john@example.com")
  void shouldCreateItem() throws Exception {
    ItemCreateDto newItem = new ItemCreateDto();
    newItem.setTitle("Headphones");
    newItem.setDescription("Noise-cancelling");
    newItem.setCategoryId(testCategory.getId());
    newItem.setPrice(150.0);
    newItem.setLatitude(new BigDecimal("63.4300"));
    newItem.setLongitude(new BigDecimal("10.3925"));

    mockMvc.perform(post("/api/items")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newItem)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Headphones"));
  }

  @Test
  @WithMockUser(username = "john@example.com")
  void shouldUpdateItem() throws Exception {
    Item item = new Item(testUser, "Old Title", "Old Desc", testCategory, 100.0,
        LocalDateTime.now(), new BigDecimal("63.0"), new BigDecimal("10.0"));
    item.setStatus(ItemStatus.FOR_SALE);
    item = itemRepository.save(item);

    ItemUpdateDto updateDto = new ItemUpdateDto();
    updateDto.setTitle("Updated Title");
    updateDto.setDescription("Updated Description");
    updateDto.setPrice(120.0);
    updateDto.setLatitude(new BigDecimal("64.0000"));
    updateDto.setLongitude(new BigDecimal("11.0000"));
    updateDto.setCategoryId(testCategory.getId());
    updateDto.setStatus(ItemStatus.RESERVED);

    mockMvc.perform(MockMvcRequestBuilders.put("/api/items/" + item.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updateDto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Updated Title"))
        .andExpect(jsonPath("$.description").value("Updated Description"))
        .andExpect(jsonPath("$.price").value(120.0))
        .andExpect(jsonPath("$.latitude").value(64.0000))
        .andExpect(jsonPath("$.longitude").value(11.0000))
        .andExpect(jsonPath("$.status").value("RESERVED"));
  }
}