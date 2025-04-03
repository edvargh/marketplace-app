package com.marketplace.backend.service;

import com.marketplace.backend.model.Category;
import com.marketplace.backend.repository.CategoryRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service for handling category related requests.
 */
@Service
public class CategoryService {

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
    return categoryRepository.findAll();
  }

  /**
   * Get a category by ID.
   *
   * @param id the category id
   * @return the category, if found
   */
  public Optional<Category> getCategoryById(Long id) {
    return categoryRepository.findById(id);
  }

  /**
   * Create a new category.
   *
   * @param category the category to create
   * @return the created category
   */
  public Category createCategory(Category category) {
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
      return Optional.empty();
    }
    category.setId(id);
    return Optional.of(categoryRepository.save(category));
  }

  /**
   * Delete a category by ID.
   *
   * @param id the id of the category to delete
   */
  public void deleteCategory(Long id) {
    categoryRepository.deleteById(id);
  }

  /**
   * Check if a category exists by ID.
   *
   * @param id the category id
   * @return true if the category exists, false otherwise
   */
  public boolean existsById(Long id) {
    return categoryRepository.existsById(id);
  }
}
