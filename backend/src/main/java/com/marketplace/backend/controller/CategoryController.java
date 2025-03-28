package com.marketplace.backend.controller;

import com.marketplace.backend.model.Category;
import com.marketplace.backend.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controller for handling category related requests.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

  private final CategoryService categoryService;

  /**
   * Constructor for CategoryController.
   *
   * @param categoryService the service for handling category related requests
   */
  public CategoryController(CategoryService categoryService) {
    this.categoryService = categoryService;
  }

  /**
   * Get all categories.
   *
   * @return a list of all categories
   */
  @GetMapping
  public List<Category> getAllCategories() {
    return categoryService.getAllCategories();
  }

  /**
   * Get category by ID.
   *
   * @param id the category ID
   * @return the category if found
   */
  @GetMapping("/{id}")
  public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
    Optional<Category> category = categoryService.getCategoryById(id);
    return category.map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  /**
   * Create or update a category.
   *
   * @param category the category to create or update
   * @return the saved category
   */
  @PostMapping
  public ResponseEntity<Category> saveCategory(@RequestBody Category category) {
    Category saved = categoryService.saveCategory(category);
    return ResponseEntity.ok(saved);
  }

  /**
   * Delete a category by ID.
   *
   * @param id the category ID to delete
   * @return HTTP 204 No Content if deleted
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
    categoryService.deleteCategory(id);
    return ResponseEntity.noContent().build();
  }
}