package com.marketplace.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

/**
 * DTO for creating an item.
 */
public class ItemCreateDto {
  private String title;
  private String description;
  private Long categoryId;
  private Double price;
  private BigDecimal latitude;
  private BigDecimal longitude;
  private List<MultipartFile> images;

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
   * Get the images of the item.
   *
   * @return the images of the item
   */
  public List<MultipartFile> getImages() { return images; }

  /**
   * Set the images of the item.
   *
   * @param images the images of the item
   */
  public void setImages(List<MultipartFile> images) { this.images = images; }
}