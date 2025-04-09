package com.marketplace.backend.service;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.ItemView;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.ItemViewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ItemViewService {
  private static final Logger logger = LoggerFactory.getLogger(ItemViewService.class);

  private final ItemViewRepository itemViewRepository;
  private final ItemRepository itemRepository;

  public ItemViewService(ItemViewRepository itemViewRepository, ItemRepository itemRepository) {
    this.itemViewRepository = itemViewRepository;
    this.itemRepository = itemRepository;
  }

  /**
   * Logs a view of an item by a user.
   */
  public void logItemView(User user, Item item) {
    logger.info("Logging view of item {} by user {}", item.getId(), user.getEmail());
    try {
      ItemView itemView = new ItemView(user, item);
      itemViewRepository.save(itemView);
      logger.debug("Item view saved successfully for item {} by user {}", item.getId(), user.getEmail());
    } catch (Exception e) {
      logger.error("Failed to log item view for item {} by user {}: {}", item.getId(), user.getEmail(), e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Returns a list of up to 8 recommended items for a user.
   * If the user has no recent views, fall back to most viewed items globally.
   */
  public List<Item> getRecommendedItems(User user) {
    logger.info("Generating recommended items for user {}", user.getEmail());
    try {
      List<ItemView> recentViews = itemViewRepository.findTop10ByUserOrderByViewedAtDesc(user);

      if (recentViews.isEmpty()) {
        return getMostViewedItemsExcludingUser(user, 8);
      }

      Set<Long> categoryIds = recentViews.stream()
          .map(iv -> iv.getItem().getCategory().getId())
          .collect(Collectors.toSet());

      List<Item> categoryBased = itemRepository.findAll().stream()
          .filter(item -> categoryIds.contains(item.getCategory().getId()))
          .filter(item -> !item.getSeller().getId().equals(user.getId()))
          .limit(8)
          .collect(Collectors.toList());

      if (categoryBased.size() >= 8) {
        return categoryBased;
      }

      Set<Long> alreadyIncluded = categoryBased.stream().map(Item::getId).collect(Collectors.toSet());

      List<Item> fallback = getMostViewedItemsExcludingUser(user, 8 - categoryBased.size()).stream()
          .filter(item -> !alreadyIncluded.contains(item.getId()))
          .toList();

      List<Item> combined = new ArrayList<>(categoryBased);
      combined.addAll(fallback);

      logger.info("Returning {} total recommendations for user {}", combined.size(), user.getEmail());
      return combined;

    } catch (Exception e) {
      logger.error("Failed to generate recommendations for user {}: {}", user.getEmail(), e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Returns the most viewed items globally, excluding those from the given user.
   */
  private List<Item> getMostViewedItemsExcludingUser(User user, int limit) {
    logger.debug("Fetching most viewed items (limit {}) excluding user {}", limit, user.getEmail());
    try {
      return itemViewRepository.findItemIdsWithViewCountsDesc().stream()
          .map(obj -> (Long) obj[0])
          .map(itemRepository::findById)
          .filter(Optional::isPresent)
          .map(Optional::get)
          .filter(item -> !item.getSeller().getId().equals(user.getId()))
          .limit(limit)
          .collect(Collectors.toList());
    } catch (Exception e) {
      logger.error("Error while fetching most viewed items: {}", e.getMessage(), e);
      throw e;
    }
  }
}
