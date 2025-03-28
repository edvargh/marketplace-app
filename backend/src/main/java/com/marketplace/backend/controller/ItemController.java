package com.marketplace.backend.controller;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.service.ItemService;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for handling item related requests.
 */
@RestController
@RequestMapping("/api/items")
public class ItemController {

  private final ItemService itemService;

  /**
   * Constructor for ItemController.
   *
   * @param itemService the service for handling item related requests
   */
  public ItemController(ItemService itemService) {
    this.itemService = itemService;
  }

  /**
   * Get all items.
   *
   * @return a list of all items
   */
  @GetMapping
  public List<Item> getAllItems() {
    return itemService.getAllItems();
  }

  /**
   * Get an item by its id.
   *
   * @param id the id of the item
   * @return the item if found, otherwise a 404 response
   */
  @GetMapping("/{id}")
  public ResponseEntity<Item> getItemById(@PathVariable Long id) {
    Optional<Item> item = itemService.getItemById(id);
    return item.map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  /**
   * Create a new item.
   *
   * @param item the item to create
   * @return the created item
   */
  @PostMapping
  public ResponseEntity<Item> createItem(@RequestBody Item item) {
    return ResponseEntity.ok(itemService.createItem(item));
  }
}
