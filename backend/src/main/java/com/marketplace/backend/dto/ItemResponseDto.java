package com.marketplace.backend.dto;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.ItemStatus;

import com.marketplace.backend.model.User;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for item responses.
 */
public class ItemResponseDto {
  private Long id;
  private String title;
  private String description;
  private Long categoryId;
  private String categoryName;
  private Double price;
  private LocalDateTime publishedDate;
  private BigDecimal latitude;
  private BigDecimal longitude;
  private ItemStatus status;
  private Long sellerId;
  private String sellerName;
  private List<String> imageUrls;
  private boolean favoritedByCurrentUser;
  private Long reservedById;



  /**
   * Default constructor.
   */
  public ItemResponseDto() {}

  /**
   * Create an ItemResponseDto from an Item entity.
   *
   * @param item       the item entity
   * @param currentUser the current user
   * @return the ItemResponseDto
   */
  public static ItemResponseDto fromEntity(Item item, User currentUser) {
    ItemResponseDto dto = new ItemResponseDto();
    dto.setId(item.getId());
    dto.setTitle(item.getTitle());
    dto.setDescription(item.getDescription());
    dto.setCategoryId(item.getCategory() != null ? item.getCategory().getId() : null);
    dto.setCategoryName(item.getCategory() != null ? item.getCategory().getName() : null);
    dto.setPrice(item.getPrice());
    dto.setPublishedDate(item.getPublishedDate());
    dto.setLatitude(item.getLatitude());
    dto.setLongitude(item.getLongitude());
    dto.setStatus(item.getStatus());
    dto.setSellerId(item.getSeller() != null ? item.getSeller().getId() : null);
    dto.setSellerName(item.getSeller() != null ? item.getSeller().getFullName() : null);
    dto.setImageUrls(item.getImages() != null
        ? item.getImages().stream().map(img -> img.getImageUrl()).collect(Collectors.toList())
        : null);

    boolean isFavorited = currentUser != null &&
        item.getFavoritedByUsers() != null &&
        item.getFavoritedByUsers().contains(currentUser);

    dto.setFavoritedByCurrentUser(isFavorited);
    dto.setReservedById(item.getReservedBy() != null ? item.getReservedBy().getId() : null);

    return dto;
  }

  /**
   * Create an ItemResponseDto from an Item entity.
   *
   * @param item the item entity
   * @return the ItemResponseDto
   */
  public static ItemResponseDto fromEntity(Item item) {
    return fromEntity(item, null);
  }

  /**
   * Get the item ID.
   *
   * @return the item ID
   */
  public Long getId() { return id; }

  /**
   * Set the item ID.
   *
   * @param id the item ID
   */
  public void setId(Long id) { this.id = id; }

  /**
   * Get the title of the item.
   *
   * @return the title of the item
   */
  public String getTitle() { return title; }

  /**
   * Set the title of the item.
   *
   * @param title the title of the item
   */
  public void setTitle(String title) { this.title = title; }

  /**
   * Get the description of the item.
   *
   * @return the description of the item
   */
  public String getDescription() { return description; }

  /**
   * Set the description of the item.
   *
   * @param description the description of the item
   */
  public void setDescription(String description) { this.description = description; }

  /**
   * Get the category ID of the item.
   *
   * @return the category ID of the item
   */
  public Long getCategoryId() { return categoryId; }

  /**
   * Set the category ID of the item.
   *
   * @param categoryId the category ID of the item
   */
  public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

  /**
   * Get the category name of the item.
   *
   * @return the category name of the item
   */
  public String getCategoryName() { return categoryName; }

  /**
   * Set the category name of the item.
   *
   * @param categoryName the category name of the item
   */
  public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

  /**
   * Get the price of the item.
   *
   * @return the price of the item
   */
  public Double getPrice() { return price; }

  /**
   * Set the price of the item.
   *
   * @param price the price of the item
   */
  public void setPrice(Double price) { this.price = price; }

  /**
   * Get the published date of the item.
   *
   * @return the published date of the item
   */
  public LocalDateTime getPublishedDate() { return publishedDate; }

  /**
   * Set the published date of the item.
   *
   * @param publishedDate the published date of the item
   */
  public void setPublishedDate(LocalDateTime publishedDate) { this.publishedDate = publishedDate; }

  /**
   * Get the latitude of the item.
   *
   * @return the latitude of the item
   */
  public BigDecimal getLatitude() { return latitude; }

  /**
   * Set the latitude of the item.
   *
   * @param latitude the latitude of the item
   */
  public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

  /**
   * Get the longitude of the item.
   *
   * @return the longitude of the item
   */
  public BigDecimal getLongitude() { return longitude; }

  /**
   * Set the longitude of the item.
   *
   * @param longitude the longitude of the item
   */
  public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

  /**
   * Get the status of the item.
   *
   * @return the status of the item
   */
  public ItemStatus getStatus() { return status; }

  /**
   * Set the status of the item.
   *
   * @param status the status of the item
   */
  public void setStatus(ItemStatus status) { this.status = status; }

  /**
   * Get the seller ID.
   *
   * @return the seller ID
   */
  public Long getSellerId() { return sellerId; }

  /**
   * Set the seller ID.
   *
   * @param sellerId the seller ID
   */
  public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

  /**
   * Get the seller name.
   *
   * @return the seller name
   */
  public String getSellerName() { return sellerName; }

  /**
   * Set the seller name.
   *
   * @param sellerName the seller name
   */
  public void setSellerName(String sellerName) { this.sellerName = sellerName; }

  /**
   * Get the image URLs of the item.
   *
   * @return the image URLs of the item
   */
  public List<String> getImageUrls() { return imageUrls; }

  /**
   * Set the image URLs of the item.
   *
   * @param imageUrls the image URLs of the item
   */
  public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

  /**
   * Check if the item is favorited by the current user.
   *
   * @return true if the item is favorited by the current user, false otherwise
   */
  public boolean isFavoritedByCurrentUser() {
    return favoritedByCurrentUser;
  }

  /**
   * Set if the item is favorited by the current user.
   *
   * @param favoritedByCurrentUser true if the item is favorited by the current user, false otherwise
   */
  public void setFavoritedByCurrentUser(boolean favoritedByCurrentUser) {
    this.favoritedByCurrentUser = favoritedByCurrentUser;
  }

  /**
   * Get the ID of the user who reserved the item.
   *
   * @return the ID of the user who reserved the item
   */
  public Long getReservedById() {
    return reservedById;
  }

  /**
   * Set the ID of the user who reserved the item.
   *
   * @param reservedById the ID of the user who reserved the item
   */
  public void setReservedById(Long reservedById) {
    this.reservedById = reservedById;
  }
}
