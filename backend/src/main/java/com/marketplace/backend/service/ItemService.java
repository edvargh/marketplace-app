package com.marketplace.backend.service;

import com.marketplace.backend.model.Image;
import com.marketplace.backend.model.ItemStatus;
import java.io.IOException;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for handling item related requests.
 */
@Service
public class ItemService {

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
   * Get all items, optionally filtered by price, category, search query, location, and distance.
   *
   * @param minPrice    the minimum price
   * @param maxPrice    the maximum price
   * @param categoryId  the category ID
   * @param searchQuery the search query
   * @param latitude    the latitude
   * @param longitude   the longitude
   * @param distanceKm  the distance in kilometers
   * @return a list of items as DTOs
   */
  public List<ItemResponseDto> getFilteredItems(Double minPrice, Double maxPrice,
                                                Long categoryId, String searchQuery,
                                                BigDecimal latitude, BigDecimal longitude,
                                                Double distanceKm) {

    String email = getAuthenticatedEmail();
    User currentUser = userRepository.findByEmail(email).orElseThrow();

    List<Item> items = itemRepository.findFilteredItems(
        currentUser.getId(),
        minPrice,
        maxPrice,
        categoryId,
        (searchQuery != null && !searchQuery.isBlank()) ? searchQuery : null,
        latitude,
        longitude,
        distanceKm
    );

    return items.stream()
        .map(item -> ItemResponseDto.fromEntity(item, currentUser))
        .toList();
  }

  /**
   * Get an item by its ID.
   *
   * @param id the ID of the item
   * @return an optional item DTO if found
   */
  public Optional<ItemResponseDto> getItemById(Long id) {
    Optional<Item> itemOpt = itemRepository.findById(id);
    if (itemOpt.isEmpty()) return Optional.empty();

    String email = getAuthenticatedEmail();
    Optional<User> userOpt = userRepository.findByEmail(email);

    if (userOpt.isPresent()) {
      return Optional.of(ItemResponseDto.fromEntity(itemOpt.get(), userOpt.get()));
    } else {
      return Optional.of(ItemResponseDto.fromEntity(itemOpt.get()));
    }
  }

  /**
   * Get all items for the current user.
   *
   * @return a list of items as DTOs
   */
  public List<ItemResponseDto> getItemsForCurrentUser() {
    String email = getAuthenticatedEmail();
    User user = userRepository.findByEmail(email).orElseThrow();

    return itemRepository.findBySeller(user).stream()
        .map(ItemResponseDto::fromEntity)
        .collect(Collectors.toList());
  }

  /**
   * Get all favorite items for the current user.
   *
   * @return a list of favorite items as DTOs
   */
  public List<ItemResponseDto> getFavoriteItemsForCurrentUser() {
    String email = getAuthenticatedEmail();
    User user = userRepository.findByEmail(email).orElseThrow();

    return user.getFavoriteItems().stream()
        .map(item -> ItemResponseDto.fromEntity(item, user))
        .collect(Collectors.toList());
  }

  /**
   * Toggle favorite status for an item.
   *
   * @param itemId the ID of the item to toggle
   * @return true if the item was toggled, false otherwise
   */
  public boolean toggleFavoriteItem(Long itemId) {
    String email = getAuthenticatedEmail();
    Optional<User> userOpt = userRepository.findByEmail(email);
    Optional<Item> itemOpt = itemRepository.findById(itemId);

    if (userOpt.isEmpty() || itemOpt.isEmpty()) return false;

    User user = userOpt.get();
    Item item = itemOpt.get();

    if (user.getFavoriteItems().contains(item)) {
      user.getFavoriteItems().remove(item);
    } else {
      user.getFavoriteItems().add(item);
    }

    userRepository.save(user);
    return true;
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
      Long userId = seller.getId(); // 👈 get the user ID for namespacing
      for (MultipartFile imageFile : dto.getImages()) {
        String url = cloudinaryService.uploadImage(userId, imageFile);
        Image image = new Image(item, url);
        item.addImage(image);
      }
    }

    itemRepository.save(item);
    return ItemResponseDto.fromEntity(item);
  }


  /**
   * Update an item, completely replacing all existing images.
   *
   * @param id the ID of the item to update
   * @param dto the updated item data
   * @return an optional updated item DTO if found
   */
  public Optional<ItemResponseDto> updateItem(Long id, ItemUpdateDto dto) {
    return itemRepository.findById(id).map(item -> {
      // Update basic fields
      if (dto.getTitle() != null) item.setTitle(dto.getTitle());
      if (dto.getDescription() != null) item.setDescription(dto.getDescription());
      if (dto.getPrice() != null) item.setPrice(dto.getPrice());
      if (dto.getLatitude() != null) item.setLatitude(dto.getLatitude());
      if (dto.getLongitude() != null) item.setLongitude(dto.getLongitude());
      if (dto.getStatus() != null) item.setStatus(dto.getStatus());

      // 🧹 Delete old images from Cloudinary
      item.getImages().forEach(image -> {
        image.setItem(null);
        try {
          String publicId = extractPublicIdFromUrl(image.getImageUrl());
          cloudinaryService.deleteImage(publicId);
        } catch (IOException e) {
          // Optionally log the error instead of crashing the update
          throw new RuntimeException("Failed to delete old image from Cloudinary", e);
        }
      });
      item.getImages().clear();

      // 📤 Upload new images
      if (dto.getImages() != null && !dto.getImages().isEmpty()) {
        Long userId = item.getSeller().getId();
        for (MultipartFile imageFile : dto.getImages()) {
          try {
            String url = cloudinaryService.uploadImage(userId, imageFile);
            Image image = new Image(item, url);
            item.addImage(image);
          } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
          }
        }
      }

      Item updated = itemRepository.save(item);
      return ItemResponseDto.fromEntity(updated);
    });
  }


  /**
   * Delete an item.
   *
   * @param id the ID of the item to delete
   * @return true if the item was deleted, false otherwise
   */
  public boolean deleteItem(Long id) {
    String email = getAuthenticatedEmail();
    Optional<User> userOpt = userRepository.findByEmail(email);
    Optional<Item> itemOpt = itemRepository.findById(id);

    if (userOpt.isEmpty() || itemOpt.isEmpty()) return false;

    User user = userOpt.get();
    Item item = itemOpt.get();

    if (!item.getSeller().getId().equals(user.getId())) {
      return false; // Only the seller can delete
    }

    itemRepository.delete(item);
    return true;
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

  private String extractPublicIdFromUrl(String imageUrl) {
    try {
      String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
      return filename.substring(0, filename.lastIndexOf(".")); // remove file extension
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid Cloudinary URL: " + imageUrl, e);
    }
  }

}
