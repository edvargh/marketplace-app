package com.marketplace.backend.repository;

import com.marketplace.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository for handling user related requests.
 */
public interface UserRepository extends JpaRepository<User, Long> {
  boolean existsByEmail(String email);
  boolean existsByPhoneNumber(String phoneNumber);
  Optional<User> findByEmail(String email);
}
