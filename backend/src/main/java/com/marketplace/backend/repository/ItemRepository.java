package com.marketplace.backend.repository;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.User;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository for handling item related requests.
 */
public interface ItemRepository extends JpaRepository<Item, Long> {

  List<Item> findBySeller(User seller);

  @Query(value = """
    SELECT * FROM Items i
    WHERE i.seller_id != :currentUserId
      AND i.status = 'FOR_SALE'
      AND (:minPrice IS NULL OR i.price >= :minPrice)
      AND (:maxPrice IS NULL OR i.price <= :maxPrice)
      AND (:categoryId IS NULL OR i.category_id = :categoryId)
      AND (
        :searchQuery IS NULL OR
        LOWER(i.title) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR
        LOWER(i.description) LIKE LOWER(CONCAT('%', :searchQuery, '%'))
      )
      AND (:latitude IS NULL OR :longitude IS NULL OR (
        6371 * acos(
          cos(radians(:latitude)) * cos(radians(i.latitude)) *
          cos(radians(i.longitude) - radians(:longitude)) +
          sin(radians(:latitude)) * sin(radians(i.latitude))
        )
      ) <= :distanceKm)
    """, nativeQuery = true)
  List<Item> findFilteredItems(
      @Param("currentUserId") Long currentUserId,
      @Param("minPrice") Double minPrice,
      @Param("maxPrice") Double maxPrice,
      @Param("categoryId") Long categoryId,
      @Param("searchQuery") String searchQuery,
      @Param("latitude") BigDecimal latitude,
      @Param("longitude") BigDecimal longitude,
      @Param("distanceKm") Double distanceKm
  );
}
