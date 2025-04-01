package com.marketplace.backend.repository;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for handling item related requests.
 */
public interface ItemRepository extends JpaRepository<Item, Long> {

  List<Item> findBySeller(User seller);

}
