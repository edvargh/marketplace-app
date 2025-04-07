package com.marketplace.backend.repository;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.User;
import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository for handling item related requests.
 */
public interface ItemRepository extends JpaRepository<Item, Long> {

  Page<Item> findBySeller(User seller, Pageable pageable);

  @Query(value = """
    SELECT * FROM Items i
    WHERE i.seller_id != :currentUserId
      AND i.status = 'FOR_SALE'
      AND (:minPrice IS NULL OR i.price >= :minPrice)
      AND (:maxPrice IS NULL OR i.price <= :maxPrice)
      AND (:searchQuery IS NULL OR
           LOWER(i.title) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR
           LOWER(i.description) LIKE LOWER(CONCAT('%', :searchQuery, '%')))
      AND (
           :latitude IS NULL OR 
           :longitude IS NULL OR 
           :distanceKm IS NULL OR (
             6371 * acos(
               cos(radians(:latitude)) * cos(radians(i.latitude)) *
               cos(radians(i.longitude) - radians(:longitude)) +
               sin(radians(:latitude)) * sin(radians(i.latitude))
             ) <= :distanceKm
           )
      )
      AND (COALESCE(:categoryIds) IS NULL OR i.category_id IN (:categoryIds))
    """, nativeQuery = true)
  Page<Item> findFilteredItems(
      @Param("currentUserId") Long currentUserId,
      @Param("minPrice") Double minPrice,
      @Param("maxPrice") Double maxPrice,
      @Param("categoryIds") List<Long> categoryIds,
      @Param("searchQuery") String searchQuery,
      @Param("latitude") BigDecimal latitude,
      @Param("longitude") BigDecimal longitude,
      @Param("distanceKm") Double distanceKm,
      Pageable pageable
      );

  @Query("SELECT i FROM Item i JOIN i.favoritedByUsers u WHERE u = :user")
  Page<Item> findFavoritesByUser(@Param("user") User user, Pageable pageable);

}
