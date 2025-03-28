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

@RestController
@RequestMapping("/api/items")
public class ItemController {

  private final ItemService itemService;

  public ItemController(ItemService itemService) {
    this.itemService = itemService;
  }

  @GetMapping
  public List<Item> getAllItems() {
    return itemService.getAllItems();
  }

  @GetMapping("/{id}")
  public ResponseEntity<Item> getItemById(@PathVariable Long id) {
    Optional<Item> item = itemService.getItemById(id);
    return item.map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<Item> createItem(@RequestBody Item item) {
    return ResponseEntity.ok(itemService.createItem(item));
  }
}
