package com.marketplace.backend.service;

import com.marketplace.backend.model.Category;
import com.marketplace.backend.repository.CategoryRepository;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CategoryServiceTest {

  private final CategoryRepository categoryRepository = mock(CategoryRepository.class);
  private final CategoryService categoryService = new CategoryService(categoryRepository);

  @Test
  void shouldReturnAllCategories() {
    List<Category> mockCategories = Arrays.asList(
        new Category(1L, "Books"),
        new Category(2L, "Electronics")
    );

    when(categoryRepository.findAll()).thenReturn(mockCategories);

    List<Category> result = categoryService.getAllCategories();

    assertEquals(2, result.size());
    assertEquals("Books", result.get(0).getName());
    verify(categoryRepository, times(1)).findAll();
  }
}
