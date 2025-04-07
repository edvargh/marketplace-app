package com.marketplace.backend.repository;

import com.marketplace.backend.model.Order;
import com.marketplace.backend.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
  Optional<Order> findTopByBuyerOrderByOrderDateDesc(User buyer);

}
