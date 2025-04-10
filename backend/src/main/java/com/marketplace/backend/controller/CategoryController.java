package com.marketplace.backend.controller;

import com.marketplace.backend.model.Category;
import com.marketplace.backend.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

  private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);

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
    logger.info("Fetching all categories");
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
    logger.info("Fetching category with ID: {}", id);
    Optional<Category> category = categoryService.getCategoryById(id);
    if (category.isPresent()) {
      logger.debug("Found category: {}", category.get().getName());
      return ResponseEntity.ok(category.get());
    } else {
      logger.warn("Category with ID {} not found", id);
      return ResponseEntity.notFound().build();
    }
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
    logger.info("Creating new category: {}", category.getName());
    try {
      Category created = categoryService.createCategory(category);
      logger.info("Category created successfully with ID: {}", created.getId());
      return ResponseEntity.ok(created);
    } catch (Exception e) {
      logger.error("Failed to create category {}: {}", category.getName(), e.getMessage(), e);
      throw e;
    }
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
    logger.info("Updating category with ID: {}", id);
    try {
      Optional<Category> updated = categoryService.updateCategory(id, category);
      if (updated.isPresent()) {
        logger.info("Category {} updated successfully", id);
        return ResponseEntity.ok(updated.get());
      } else {
        logger.warn("Category with ID {} not found for update", id);
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      logger.error("Failed to update category {}: {}", id, e.getMessage(), e);
      throw e;
    }
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
    logger.info("Deleting category with ID: {}", id);
    try {
      categoryService.deleteCategory(id);
      logger.info("Category {} deleted successfully", id);
      return ResponseEntity.noContent().build();
    } catch (Exception e) {
      logger.error("Failed to delete category {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }
}