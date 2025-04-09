package com.marketplace.backend.controller;

import com.marketplace.backend.dto.ItemCreateDto;
import com.marketplace.backend.dto.ItemUpdateDto;
import com.marketplace.backend.dto.ItemResponseDto;
import com.marketplace.backend.model.ItemStatus;
import com.marketplace.backend.service.ItemService;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

  private static final Logger logger = LoggerFactory.getLogger(ItemController.class);

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
   * Get all items, optionally filtered by price, category, search query, location, and distance.
   *
   * @param minPrice    the minimum price
   * @param maxPrice    the maximum price
   * @param categoryIds  the category ID
   * @param searchQuery the search query
   * @param latitude    the latitude
   * @param longitude   the longitude
   * @param distanceKm  the distance in kilometers
   * @return a list of items as DTOs
   */
  @GetMapping
  public ResponseEntity<List<ItemResponseDto>> getFilteredItems(
      @RequestParam(required = false) Double minPrice,
      @RequestParam(required = false) Double maxPrice,
      @RequestParam(required = false) List<Long> categoryIds,
      @RequestParam(required = false) String searchQuery,
      @RequestParam(required = false) BigDecimal latitude,
      @RequestParam(required = false) BigDecimal longitude,
      @RequestParam(required = false) Double distanceKm,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "6") int size
  ) {
    logger.info("Fetching filtered items with params: minPrice={}, maxPrice={}, categoryIds={}, search={}, location=({},{}), distance={}, page={}, size={}",
        minPrice, maxPrice, categoryIds, searchQuery, latitude, longitude, distanceKm, page, size);

    List<ItemResponseDto> items = itemService.getFilteredItems(
            minPrice, maxPrice, categoryIds, searchQuery, latitude, longitude, distanceKm, page, size
    );
    return ResponseEntity.ok(items);
  }


  /**
   * Get an item by its id.
   *
   * @param id the id of the item
   * @return the item if found, otherwise a 404 response
   */
  @GetMapping("/{id}")
  public ResponseEntity<ItemResponseDto> getItemById(@PathVariable Long id) {
    logger.info("Fetching item with ID: {}", id);

    Optional<ItemResponseDto> item = itemService.getItemById(id);
    if (item.isPresent()) {
      logger.debug("Found item: {}", item.get().getTitle());
      return ResponseEntity.ok(item.get());
    } else {
      logger.warn("Item with ID {} not found", id);
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get all items for the current user.
   *
   * @return a list of items as DTOs
   */
  @GetMapping("/my-items")
  public ResponseEntity<List<ItemResponseDto>> getItemsForCurrentUser(
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "6") int size
  ) {
    logger.info("Fetching current user's items");
    List<ItemResponseDto> myItems = itemService.getItemsForCurrentUser(page, size);
    return ResponseEntity.ok(myItems);
  }

  /**
   * Get all favorite items for the current user.
   *
   * @return a list of favorite items as DTOs
   */
  @GetMapping("/favorites")
  public ResponseEntity<List<ItemResponseDto>> getFavoriteItemsForCurrentUser(
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "6") int size
  ) {
    logger.info("Fetching favorite items for current user");
    List<ItemResponseDto> favorites = itemService.getFavoriteItemsForCurrentUser(page, size);
    return ResponseEntity.ok(favorites);
  }

  /**
   * Toggle favorite status for an item.
   * If the item is already marked favorite, it will be removed.
   * If it's not, it will be added.
   *
   * @param itemId the ID of the item to toggle
   * @return 200 OK if successful, 404 if item not found
   */
  @PutMapping("/{itemId}/favorite-toggle")
  public ResponseEntity<Void> toggleFavorite(@PathVariable Long itemId) {
    logger.info("Toggling favorite status for item with ID: {}", itemId);

    boolean success = itemService.toggleFavoriteItem(itemId);

    if (success) {
      logger.info("Successfully toggled favorite status for item {}", itemId);
      return ResponseEntity.ok().build();
    } else {
      logger.warn("Failed to toggle favorite for item {}: item not found", itemId);
      return ResponseEntity.notFound().build();
    }
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
    logger.info("Creating new item: {}", dto.getTitle());
    try {
      dto.setImages(images);
      ItemResponseDto createdItem = itemService.createItem(dto);

      logger.info("Item created successfully with ID: {}", createdItem.getId());
      return ResponseEntity.ok(createdItem);
    } catch (Exception e) {
      logger.error("Failed to create item {}: {}", dto.getTitle(), e.getMessage(), e);
      throw e;
    }
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
    logger.info("Updating item with ID: {}", id);
    try {
      dto.setImages(images);
      Optional<ItemResponseDto> updatedItem = itemService.updateItem(id, dto);

      if (updatedItem.isPresent()) {
        logger.info("Item {} updated successfully", id);
        return ResponseEntity.ok(updatedItem.get());
      } else {
        logger.warn("Item with ID {} not found for update", id);
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      logger.error("Failed to update item {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Delete an item.
   *
   * @param id the ID of the item to delete
   * @return a 204 response if successful, 404 otherwise
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
    logger.info("Deleting item with ID: {}", id);
    try {
      boolean deleted = itemService.deleteItem(id);

      if (deleted) {
        logger.info("Item {} deleted successfully", id);
        return ResponseEntity.noContent().build();
      } else {
        logger.warn("Item with ID {} not found for deletion", id);
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      logger.error("Failed to delete item {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Update the status of an item.
   *
   * @param id the ID of the item to update
   * @param newStatus the new status of the item
   * @return a 200 response if successful, 404 otherwise
   */
  @PutMapping("/{id}/status")
  public ResponseEntity<Void> updateItemStatus(
      @PathVariable Long id,
      @RequestParam("value") ItemStatus newStatus,
      @RequestParam(value = "buyerId", required = false) Long buyerId
  ) {
    logger.info("Updating status of item with ID: {} to {}", id, newStatus);
    try {
      boolean updated = itemService.updateItemStatus(id, newStatus, buyerId);

      if (updated) {
        logger.info("Status for item {} updated successfully to {}", id, newStatus);
        return ResponseEntity.ok().build();
      } else {
        logger.warn("Item with ID {} not found for status update", id);
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      logger.error("Failed to update status for item {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }
}
