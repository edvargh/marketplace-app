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
   * Returns a list of recommended items for a user based on recently viewed categories.
   */
  public List<Item> getRecommendedItems(User user) {
    List<ItemView> recentViews = itemViewRepository.findTop10ByUserOrderByViewedAtDesc(user);

    Set<Long> viewedItemIds = recentViews.stream()
        .map(iv -> iv.getItem().getId())
        .collect(Collectors.toSet());

    Set<Long> categoryIds = recentViews.stream()
        .map(iv -> iv.getItem().getCategory().getId())
        .collect(Collectors.toSet());

    return itemRepository.findAll().stream()
        .filter(item ->
            categoryIds.contains(item.getCategory().getId()) &&
                !viewedItemIds.contains(item.getId()) &&
                !item.getSeller().getId().equals(user.getId()))
        .limit(10)
        .collect(Collectors.toList());
  }
}
