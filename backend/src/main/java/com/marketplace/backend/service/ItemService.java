package com.marketplace.backend.service;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.repository.ItemRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ItemService {

  private final ItemRepository itemRepository;

  public ItemService(ItemRepository itemRepository) {
    this.itemRepository = itemRepository;
  }

  public List<Item> getAllItems() {
    return itemRepository.findAll();
  }

  public Optional<Item> getItemById(Long id) {
    return itemRepository.findById(id);
  }

  public Item createItem(Item item) {
    return itemRepository.save(item);
  }
}
