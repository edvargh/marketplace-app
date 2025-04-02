package com.marketplace.backend.controller;

import com.marketplace.backend.dto.ItemCreateDto;
import com.marketplace.backend.dto.ItemUpdateDto;
import com.marketplace.backend.dto.ItemResponseDto;
import com.marketplace.backend.service.ItemService;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
   * Get all items for the current user.
   *
   * @return a list of items as DTOs
   */
  @GetMapping("/my-items")
  public ResponseEntity<List<ItemResponseDto>> getItemsForCurrentUser() {
    List<ItemResponseDto> myItems = itemService.getItemsForCurrentUser();
    return ResponseEntity.ok(myItems);
  }

  /**
   * Get all favorite items for the current user.
   *
   * @return a list of favorite items as DTOs
   */
  @GetMapping("/favorites")
  public ResponseEntity<List<ItemResponseDto>> getFavoriteItemsForCurrentUser() {
    List<ItemResponseDto> favoriteItems = itemService.getFavoriteItemsForCurrentUser();
    return ResponseEntity.ok(favoriteItems);
  }

  /**
   * Toggle favorite status for an item.
   * If the item is already favorited, it will be removed.
   * If it's not favorited, it will be added.
   *
   * @param itemId the ID of the item to toggle
   * @return 200 OK if successful, 404 if item not found
   */
  @PutMapping("/{itemId}/favorite-toggle")
  public ResponseEntity<Void> toggleFavorite(@PathVariable Long itemId) {
    boolean success = itemService.toggleFavoriteItem(itemId);
    return success ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
  }


  /**
   * Create a new item.
   *
   * @param dto the item to create
   * @return the created item as a DTO
   */
  @PostMapping("/create")
  public ResponseEntity<ItemResponseDto> createItem(
      @RequestPart("item") ItemCreateDto dto,
      @RequestPart(value = "images", required = false) List<MultipartFile> images
  ) throws IOException {
    dto.setImages(images);
    return ResponseEntity.ok(itemService.createItem(dto));
  }

  /**
   * Update an item.
   *
   * @param id the ID of the item to update
   * @param dto the updated item data
   * @return the updated item as a DTO if successful, 404 otherwise
   */
  @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ItemResponseDto> updateItem(
      @PathVariable Long id,
      @RequestPart("dto") ItemUpdateDto dto,
      @RequestPart(value = "images", required = false) List<MultipartFile> images
  ) {
    dto.setImages(images);
    Optional<ItemResponseDto> updatedItem = itemService.updateItem(id, dto);
    return updatedItem.map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  /**
   * Delete an item.
   *
   * @param id the ID of the item to delete
   * @return a 204 response if successful, 404 otherwise
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
    boolean deleted = itemService.deleteItem(id);
    return deleted ? ResponseEntity.noContent().build()
        : ResponseEntity.notFound().build();
  }
}
