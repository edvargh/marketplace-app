package com.marketplace.backend.service;

import com.marketplace.backend.model.Image;
import com.marketplace.backend.model.ItemStatus;
import java.io.IOException;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.marketplace.backend.dto.ItemCreateDto;
import com.marketplace.backend.dto.ItemResponseDto;
import com.marketplace.backend.dto.ItemUpdateDto;
import com.marketplace.backend.model.Category;
import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.CategoryRepository;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for handling item related requests.
 */
@Service
public class ItemService {

  private static final Logger logger = LoggerFactory.getLogger(ItemService.class);

  private final ItemRepository itemRepository;
  private final UserRepository userRepository;
  private final CategoryRepository categoryRepository;

  private final CloudinaryService cloudinaryService;

  /**
   * Constructor for ItemService.
   *
   * @param itemRepository     the repository for handling item entities
   * @param userRepository      the repository for handling user entities
   * @param categoryRepository the repository for handling category entities
   * @param cloudinaryService  the service for handling Cloudinary related operations
   */
  @Autowired
  public ItemService(ItemRepository itemRepository,
                     UserRepository userRepository,
                     CategoryRepository categoryRepository, CloudinaryService cloudinaryService) {
    this.itemRepository = itemRepository;
    this.userRepository = userRepository;
    this.categoryRepository = categoryRepository;
    this.cloudinaryService = cloudinaryService;
  }

  /**
   * Find an item by its ID.
   *
   * @param id the ID of the item
   * @return an optional item if found
   */
  public Optional<Item> findById(Long id) {
    logger.debug("Finding item with ID: {}", id);
    return itemRepository.findById(id);
  }

  /**
   * Get all items, optionally filtered by price, category, search query, location, and distance.
   *
   * @param minPrice    the minimum price
   * @param maxPrice    the maximum price
   * @param categoryIds the category ID
   * @param searchQuery the search query
   * @param latitude    the latitude
   * @param longitude   the longitude
   * @param distanceKm  the distance in kilometers
   * @param page        the page number
   * @param size        the page size
   * @return a list of items as DTOs
   */
  public List<ItemResponseDto> getFilteredItems(Double minPrice, Double maxPrice,
                                                List<Long> categoryIds, String searchQuery,
                                                BigDecimal latitude, BigDecimal longitude,
                                                Double distanceKm,
                                                int page, int size) {

    try {
      String email = getAuthenticatedEmail();
      User currentUser = userRepository.findByEmail(email).orElseThrow();
      Pageable pageable = PageRequest.of(page, size);

      logger.info("Fetching filtered items for user: {}", currentUser.getEmail());

      Page<Item> itemsPage = itemRepository.findFilteredItems(
          currentUser.getId(), minPrice, maxPrice,
          (categoryIds != null && !categoryIds.isEmpty()) ? categoryIds : null,
          (searchQuery != null && !searchQuery.isBlank()) ? searchQuery : null,
          latitude, longitude, distanceKm, pageable);

      return itemsPage.getContent().stream()
          .map(item -> ItemResponseDto.fromEntity(item, currentUser))
          .toList();
    } catch (Exception e) {
      logger.error("Failed to fetch filtered items: {}", e.getMessage(), e);
      throw e;
    }
  }


  /**
   * Get an item by its ID.
   *
   * @param id the ID of the item
   * @return an optional item DTO if found
   */
  public Optional<ItemResponseDto> getItemById(Long id) {
    logger.info("Fetching item with ID: {}", id);
    Optional<Item> itemOpt = itemRepository.findById(id);
    if (itemOpt.isEmpty()) {
      logger.warn("Item with ID {} not found", id);
      return Optional.empty();
    }
    String email = getAuthenticatedEmail();
    User user = userRepository.findByEmail(email).orElseThrow(() ->
        new RuntimeException("Authenticated user not found in database")
    );

    return Optional.of(ItemResponseDto.fromEntity(itemOpt.get(), user));
  }

  /**
   * Get all items for the current user.
   *
   * @return a list of items as DTOs
   */
  public List<ItemResponseDto> getItemsForCurrentUser(int page, int size) {
    String email = getAuthenticatedEmail();
    logger.info("Fetching items for current user: {}", email);
    try {
      User user = userRepository.findByEmail(email).orElseThrow();
      Pageable pageable = PageRequest.of(page, size);

      Page<Item> paged = itemRepository.findBySeller(user, pageable);
      return paged.getContent().stream().map(ItemResponseDto::fromEntity).collect(Collectors.toList());
    } catch (Exception e) {
      logger.error("Failed to fetch items for user {}: {}", email, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Get all favorite items for the current user.
   *
   * @return a list of favorite items as DTOs
   */
  public List<ItemResponseDto> getFavoriteItemsForCurrentUser(int page, int size) {
    String email = getAuthenticatedEmail();
    logger.info("Fetching favorite items for user: {}", email);
    try {
      User user = userRepository.findByEmail(email).orElseThrow();
      Pageable pageable = PageRequest.of(page, size);

      Page<Item> paged = itemRepository.findFavoritesByUser(user, pageable);
      return paged.getContent().stream()
          .map(item -> ItemResponseDto.fromEntity(item, user))
          .toList();
    } catch (Exception e) {
      logger.error("Failed to fetch favorite items for user {}: {}", email, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Toggle favorite status for an item.
   *
   * @param itemId the ID of the item to toggle
   * @return true if the item was toggled, false otherwise
   */
  public boolean toggleFavoriteItem(Long itemId) {
    String email = getAuthenticatedEmail();
    logger.info("Toggling favorite status for item {} by user {}", itemId, email);
    try {
      Optional<User> userOpt = userRepository.findByEmail(email);
      Optional<Item> itemOpt = itemRepository.findById(itemId);

      if (userOpt.isEmpty() || itemOpt.isEmpty()) {
        logger.warn("User or item not found. user: {}, item: {}", email, itemId);
        return false;
      }

      User user = userOpt.get();
      Item item = itemOpt.get();

      if (user.getFavoriteItems().contains(item)) {
        user.getFavoriteItems().remove(item);
      } else {
        user.getFavoriteItems().add(item);
      }

      userRepository.save(user);
      return true;
    } catch (Exception e) {
      logger.error("Failed to toggle favorite item {}: {}", itemId, e.getMessage(), e);
      throw e;
    }
  }


  /**
   * Create a new item.
   *
   * @param dto the item to create
   * @return the created item as a DTO
   * @throws IOException if an error occurs during image upload
   */
  public ItemResponseDto createItem(ItemCreateDto dto) throws IOException {
    String email = getAuthenticatedEmail();
    logger.info("Creating item '{}' for user {}", dto.getTitle(), email);
    try {
      User seller = userRepository.findByEmail(email).orElseThrow();
      Category category = categoryRepository.findById(dto.getCategoryId()).orElseThrow();

      Item item = new Item();
      item.setSeller(seller);
      item.setCategory(category);
      item.setTitle(dto.getTitle());
      item.setDescription(dto.getDescription());
      item.setPrice(dto.getPrice());
      item.setLatitude(dto.getLatitude());
      item.setLongitude(dto.getLongitude());
      item.setPublishedDate(LocalDateTime.now());
      item.setStatus(ItemStatus.FOR_SALE);

      if (dto.getImages() != null && !dto.getImages().isEmpty()) {
        logger.debug("Uploading {} images to Cloudinary", dto.getImages().size());
        Long userId = seller.getId();
        for (MultipartFile imageFile : dto.getImages()) {
          String url = cloudinaryService.uploadImage(userId, imageFile);
          Image image = new Image(item, url);
          item.addImage(image);
        }
      }

      itemRepository.save(item);
      logger.info("Item '{}' created successfully", dto.getTitle());
      return ItemResponseDto.fromEntity(item);
    } catch (Exception e) {
      logger.error("Failed to create item '{}': {}", dto.getTitle(), e.getMessage(), e);
      throw e;
    }
  }


  /**
   * Update an item, completely replacing all existing images.
   *
   * @param id the ID of the item to update
   * @param dto the updated item data
   * @return an optional updated item DTO if found
   */
  public Optional<ItemResponseDto> updateItem(Long id, ItemUpdateDto dto) {
    logger.info("Updating item with ID: {}", id);
    try {
      return itemRepository.findById(id).map(item -> {
        if (dto.getTitle() != null) item.setTitle(dto.getTitle());
        if (dto.getDescription() != null) item.setDescription(dto.getDescription());
        if (dto.getPrice() != null) item.setPrice(dto.getPrice());
        if (dto.getLatitude() != null) item.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) item.setLongitude(dto.getLongitude());
        if (dto.getStatus() != null) item.setStatus(dto.getStatus());

        logger.debug("Replacing {} existing images", item.getImages().size());
        item.getImages().forEach(image -> {
          image.setItem(null);
          try {
            String publicId = extractPublicIdFromUrl(image.getImageUrl());
            cloudinaryService.deleteImage(publicId);
          } catch (IOException e) {
            logger.error("Failed to delete image from Cloudinary: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete old image from Cloudinary", e);
          }
        });
        item.getImages().clear();

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
          Long userId = item.getSeller().getId();
          for (MultipartFile imageFile : dto.getImages()) {
            try {
              String url = cloudinaryService.uploadImage(userId, imageFile);
              Image image = new Image(item, url);
              item.addImage(image);
            } catch (IOException e) {
              logger.error("Failed to upload image to Cloudinary: {}", e.getMessage(), e);
              throw new RuntimeException("Failed to upload image", e);
            }
          }
        }

        Item updated = itemRepository.save(item);
        logger.info("Item with ID {} updated successfully", id);
        return ItemResponseDto.fromEntity(updated);
      });
    } catch (Exception e) {
      logger.error("Failed to update item {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }


  /**
   * Delete an item.
   *
   * @param id the ID of the item to delete
   * @return true if the item was deleted, false otherwise
   */
  public boolean deleteItem(Long id) {
    String email = getAuthenticatedEmail();
    logger.info("Deleting item with ID {} by user {}", id, email);
    try {
      Optional<User> userOpt = userRepository.findByEmail(email);
      Optional<Item> itemOpt = itemRepository.findById(id);

      if (userOpt.isEmpty() || itemOpt.isEmpty()) {
        logger.warn("Item or user not found for deletion. user: {}, item: {}", email, id);
        return false;
      }

      User user = userOpt.get();
      Item item = itemOpt.get();

      if (!item.getSeller().getId().equals(user.getId())) {
        logger.warn("User {} tried to delete item {} not owned by them", email, id);
        return false;
      }

      itemRepository.delete(item);
      logger.info("Item {} deleted successfully", id);
      return true;
    } catch (Exception e) {
      logger.error("Failed to delete item {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Update the status of an item.
   *
   * @param itemId the ID of the item to update
   * @param newStatus the new status of the item
   * @return true if the status was updated, false otherwise
   */
  public boolean updateItemStatus(Long itemId, ItemStatus newStatus, Long buyerId) {
    String email = getAuthenticatedEmail();
    logger.info("Updating status of item {} to {} by user {}", itemId, newStatus, email);
    try {
      Optional<User> sellerOpt = userRepository.findByEmail(email);
      Optional<Item> itemOpt = itemRepository.findById(itemId);

      if (sellerOpt.isEmpty() || itemOpt.isEmpty()) {
        logger.warn("Seller or item not found. seller: {}, item: {}", email, itemId);
        return false;
      }

      User seller = sellerOpt.get();
      Item item = itemOpt.get();

      if (!item.getSeller().getId().equals(seller.getId())) {
        logger.warn("User {} is not the seller of item {}", email, itemId);
        return false;
      }

      item.setStatus(newStatus);

      if (newStatus == ItemStatus.RESERVED) {
        if (buyerId == null) {
          logger.warn("Cannot reserve item {}: buyerId is null", itemId);
          return false;
        }
        Optional<User> buyerOpt = userRepository.findById(buyerId);
        if (buyerOpt.isEmpty()) {
          logger.warn("Cannot reserve item {}: buyer not found", itemId);
          return false;
        }
        item.setReservedBy(buyerOpt.get());
      } else {
        item.setReservedBy(null);
      }

      itemRepository.save(item);
      logger.info("Item {} status updated to {}", itemId, newStatus);
      return true;
    } catch (Exception e) {
      logger.error("Failed to update status of item {}: {}", itemId, e.getMessage(), e);
      throw e;
    }
  }


  /**
   * Get the email of the authenticated user.
   *
   * @return the email of the authenticated user
   */
  private String getAuthenticatedEmail() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication.getName();
  }

  /**
   * Extract the public ID from a Cloudinary URL.
   *
   * @param imageUrl the Cloudinary URL
   * @return the public ID
   */
  private String extractPublicIdFromUrl(String imageUrl) {
    try {
      String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
      return filename.substring(0, filename.lastIndexOf("."));
    } catch (Exception e) {
      logger.error("Failed to extract public ID from URL: {}", imageUrl, e);
      throw new IllegalArgumentException("Invalid Cloudinary URL: " + imageUrl, e);
    }
  }
}
