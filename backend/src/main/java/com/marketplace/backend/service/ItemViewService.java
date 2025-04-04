package com.marketplace.backend.service;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.ItemView;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.ItemViewRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ItemViewService {

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
    ItemView itemView = new ItemView(user, item);
    itemViewRepository.save(itemView);
  }

  /**
   * Returns a list of up to 8 recommended items for a user.
   * If the user has no recent views, fall back to most viewed items globally.
   */
  public List<Item> getRecommendedItems(User user) {
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

    if (categoryBased.size() >= 8) return categoryBased;

    Set<Long> alreadyIncluded = categoryBased.stream().map(Item::getId).collect(Collectors.toSet());
    List<Item> fallback = getMostViewedItemsExcludingUser(user, 8 - categoryBased.size()).stream()
        .filter(item -> !alreadyIncluded.contains(item.getId()))
        .collect(Collectors.toList());

    List<Item> combined = new ArrayList<>(categoryBased);
    combined.addAll(fallback);
    return combined;
  }

  /**
   * Returns the most viewed items globally, excluding those from the given user.
   */
  private List<Item> getMostViewedItemsExcludingUser(User user, int limit) {
    return itemViewRepository.findItemIdsWithViewCountsDesc().stream()
        .map(obj -> (Long) obj[0])
        .map(itemRepository::findById)
        .filter(Optional::isPresent)
        .map(Optional::get)
        .filter(item -> !item.getSeller().getId().equals(user.getId()))
        .limit(limit)
        .collect(Collectors.toList());
  }
}
