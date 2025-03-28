package com.marketplace.backend.repository;

import com.marketplace.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for handling category related requests.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {
}