package com.marketplace.backend.repository;

import com.marketplace.backend.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for handling item related requests.
 */
public interface ItemRepository extends JpaRepository<Item, Long> {
}
