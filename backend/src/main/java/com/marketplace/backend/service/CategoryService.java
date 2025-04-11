package com.marketplace.backend.service;

import com.marketplace.backend.model.Category;
import com.marketplace.backend.repository.CategoryRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service for handling category related requests.
 */
@Service
public class CategoryService {

  private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

  private final CategoryRepository categoryRepository;

  /**
   * Instantiates a new Category service.
   *
   * @param categoryRepository the category repository
   */
  public CategoryService(CategoryRepository categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  /**
   * Get all categories.
   *
   * @return the list of all categories
   */
  public List<Category> getAllCategories() {
    logger.debug("Retrieving all categories from database");
    return categoryRepository.findAll();
  }

  /**
   * Get a category by ID.
   *
   * @param id the category id
   * @return the category, if found
   */
  public Optional<Category> getCategoryById(Long id) {
    logger.debug("Retrieving category with ID: {}", id);
    return categoryRepository.findById(id);
  }

  /**
   * Create a new category.
   *
   * @param category the category to create
   * @return the created category
   */
  public Category createCategory(Category category) {
    if (categoryRepository.existsByName(category.getName())) {
      logger.debug("Category with name {} already exists", category.getName());
      throw new IllegalArgumentException("Category name already exists");
    }
    logger.debug("Creating new category: {}", category.getName());
    return categoryRepository.save(category);
  }

  /**
   * Update an existing category.
   *
   * @param id       the id of the category to update
   * @param category the updated category
   * @return the updated category, if found
   */
  public Optional<Category> updateCategory(Long id, Category category) {
    if (!categoryRepository.existsById(id)) {
      logger.debug("Category with ID {} does not exist", id);
      return Optional.empty();
    }

    if (categoryRepository.existsByName(category.getName())) {
      logger.debug("Category with name {} already exists", category.getName());
      throw new IllegalArgumentException("Category name already exists");
    }

    category.setId(id);
    logger.debug("Updating category with ID {}: {}", id, category.getName());
    Category updated = categoryRepository.save(category);
    logger.debug("Category updated successfully: {}", updated.getName());
    return Optional.of(updated);
  }
}
