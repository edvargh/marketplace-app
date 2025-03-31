package com.marketplace.backend.repository;

import com.marketplace.backend.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {
  List<Image> findByItemId(Long itemId);
}
