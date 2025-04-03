package com.marketplace.backend.controller;

import com.marketplace.backend.model.Category;
import com.marketplace.backend.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controller for handling category related requests.
 */
@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
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
   * Create a category.
   *
   * @param category the category to create
   * @return the created category
   */
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public ResponseEntity<Category> createCategory(@RequestBody Category category) {
    Category created = categoryService.createCategory(category);
    return ResponseEntity.ok(created);
  }

  /**
   * Update a category by ID.
   *
   * @param id       the category ID to update
   * @param category the updated category data
   * @return the updated category
   */
  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/{id}")
  public ResponseEntity<Category> updateCategory(
      @PathVariable Long id,
      @RequestBody Category category
  ) {
    return categoryService.updateCategory(id, category)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  /**
   * Delete a category by ID.
   *
   * @param id the category ID to delete
   * @return HTTP 204 No Content if deleted
   */
  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
    categoryService.deleteCategory(id);
    return ResponseEntity.noContent().build();
  }
}