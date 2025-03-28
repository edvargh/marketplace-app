package com.marketplace.backend.service;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.repository.ItemRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Service for handling item related requests.
 */
@Service
public class ItemService {

  private final ItemRepository itemRepository;

  /**
   * Instantiates a new Item service.
   *
   * @param itemRepository the item repository
   */
  public ItemService(ItemRepository itemRepository) {
    this.itemRepository = itemRepository;
  }

  /**
   * Get all items.
   *
   * @return the list of all items
   */
  public List<Item> getAllItems() {
    return itemRepository.findAll();
  }

  /**
   * Get item by id.
   *
   * @param id the id
   * @return the item by id
   */
  public Optional<Item> getItemById(Long id) {
    return itemRepository.findById(id);
  }

  /**
   * Create item.
   *
   * @param item the item
   * @return the item
   */
  public Item createItem(Item item) {
    return itemRepository.save(item);
  }
}
