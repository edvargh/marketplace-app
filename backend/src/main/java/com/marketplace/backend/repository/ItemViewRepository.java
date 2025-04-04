package com.marketplace.backend.repository;

import com.marketplace.backend.model.ItemView;
import com.marketplace.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Repository for handling item view related requests.
 */
public interface ItemViewRepository extends JpaRepository<ItemView, Integer> {

  /**
   * Find the top 10 item views for a given user, ordered by the viewed date in descending order.
   *
   * @param user the user whose item views are to be found
   * @return a list of the top 10 item views for the user
   */
  List<ItemView> findTop10ByUserOrderByViewedAtDesc(User user);

  /**
   * Find item IDs with their view count, ordered by most viewed.
   *
   * @return a list of [itemId, viewCount] pairs
   */
  @Query("SELECT iv.item.id, COUNT(iv) FROM ItemView iv GROUP BY iv.item.id ORDER BY COUNT(iv) DESC")
  List<Object[]> findItemIdsWithViewCountsDesc();
}
