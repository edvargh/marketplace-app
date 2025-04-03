package com.marketplace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.backend.model.Category;
import com.marketplace.backend.repository.CategoryRepository;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;



import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the CategoryController.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class CategoryControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private CategoryRepository categoryRepository;

  @Autowired
  private CategoryService categoryService;

  @Autowired
  private ItemRepository itemRepository;

  private Category toysCategory;

  /**
   * Set up test data.
   */
  @BeforeEach
  void setUp() {
    itemRepository.deleteAll();
    categoryRepository.deleteAll();
    toysCategory = categoryRepository.save(new Category("Toys"));
    categoryRepository.save(new Category("Fashion"));
  }

  /**
   * Test to get all categories.
   */
  @Test
  @WithMockUser
  void shouldReturnAllCategories() throws Exception {
    mockMvc.perform(get("/api/categories"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.length()", is(2)));
  }

  /**
   * Test to get a category by ID.
   */
  @Test
  @WithMockUser
  void shouldReturnCategoryById() throws Exception {
    mockMvc.perform(get("/api/categories/" + toysCategory.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Toys"));
  }

  /**
   * Test creating a new category.
   */
  @Test
  @WithMockUser(roles = "ADMIN")
  void shouldCreateCategory() throws Exception {
    Category newCategory = new Category("Books");

    mockMvc.perform(post("/api/categories")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newCategory)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Books"));
  }

  /**
   * Test updating a category.
   */
  @Test
  @WithMockUser(roles = "ADMIN")
  void shouldUpdateCategory() throws Exception {
    Category updatedCategory = new Category("Updated Toys");

    mockMvc.perform(put("/api/categories/" + toysCategory.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updatedCategory)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Updated Toys"));
  }

  /**
   * Test deleting a category.
   */
  @Test
  @WithMockUser(roles = "ADMIN")
  void shouldDeleteCategory() throws Exception {
    mockMvc.perform(delete("/api/categories/" + toysCategory.getId()))
        .andExpect(status().isNoContent());
  }

  /**
   * Test existsById returns true for an existing category.
   */
  @Test
  @WithMockUser
  void existsByIdReturnsTrue() {
    boolean exists = categoryService.existsById(toysCategory.getId());
    assertTrue(exists);
  }
}
