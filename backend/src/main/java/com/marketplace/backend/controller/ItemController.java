package com.marketplace.backend.controller;

import com.marketplace.backend.dto.ItemCreateDto;
import com.marketplace.backend.dto.ItemUpdateDto;
import com.marketplace.backend.dto.ItemResponseDto;
import com.marketplace.backend.service.ItemService;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling item related requests.
 */
@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:5173")
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
   * @return a list of all items as DTOs
   */
  @GetMapping("/all-items")
  public List<ItemResponseDto> getAllItems() {
    return itemService.getAllItems();
  }

  /**
   * Get an item by its id.
   *
   * @param id the id of the item
   * @return the item if found, otherwise a 404 response
   */
  @GetMapping("/{id}")
  public ResponseEntity<ItemResponseDto> getItemById(@PathVariable Long id) {
    Optional<ItemResponseDto> item = itemService.getItemById(id);
    return item.map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  /**
   * Create a new item.
   *
   * @param dto the item to create
   * @return the created item as a DTO
   */
  @PostMapping
  public ResponseEntity<ItemResponseDto> createItem(@RequestBody ItemCreateDto dto) {
    return ResponseEntity.ok(itemService.createItem(dto));
  }

  /**
   * Update an item.
   *
   * @param id the ID of the item to update
   * @param dto the updated item data
   * @return the updated item as a DTO if successful, 404 otherwise
   */
  @PutMapping("/{id}")
  public ResponseEntity<ItemResponseDto> updateItem(@PathVariable Long id, @RequestBody ItemUpdateDto dto) {
    Optional<ItemResponseDto> updatedItem = itemService.updateItem(id, dto);
    return updatedItem.map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }
}
