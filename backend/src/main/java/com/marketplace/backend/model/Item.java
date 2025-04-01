package com.marketplace.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Model for an item.
 */
@Entity
@Table(name = "Items")
public class Item {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "seller_id", nullable = false)
  private User seller;

  private String title;
  private String description;

  @ManyToOne
  @JoinColumn(name = "category_id")
  private Category category;

  private Double price;

  @Column(name = "published_date", columnDefinition = "TIMESTAMP")
  private LocalDateTime publishedDate;

  @Column(precision = 9, scale = 6)
  private BigDecimal latitude;

  @Column(precision = 9, scale = 6)
  private BigDecimal longitude;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ItemStatus status;

  @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Image> images = new ArrayList<>();



  /**
   * Default constructor.
   */
  public Item() {}

  /**
   * Constructor with all fields.
   *
   * @param seller       the seller of the item
   * @param title        the title of the item
   * @param description  the description of the item
   * @param category     the category of the item
   * @param price        the price of the item
   * @param publishedDate the published date of the item
   * @param latitude     the latitude of the item
   * @param longitude    the longitude of the item
   */
  public Item(User seller, String title, String description, Category category, Double price,
              LocalDateTime publishedDate, BigDecimal latitude, BigDecimal longitude) {
    this.seller = seller;
    this.title = title;
    this.description = description;
    this.category = category;
    this.price = price;
    this.publishedDate = publishedDate;
    this.latitude = latitude;
    this.longitude = longitude;
    this.status = ItemStatus.FOR_SALE;
  }


  /**
   * Get the item id.
   *
   * @return the item id
   */
  public Long getId() {
    return id;
  }

  /**
   * Set the item id.
   *
   * @param id the item id
   */
  public void setId(Long id) {
    this.id = id;
  }

  /**
   * Get the seller of the item.
   *
   * @return the seller of the item
   */
  public User getSeller() {
    return seller;
  }

  /**
   * Set the seller of the item.
   *
   * @param seller the seller of the item
   */
  public void setSeller(User seller) {
    this.seller = seller;
  }

  /**
   * Get the title of the item.
   *
   * @return the title of the item
   */
  public String getTitle() {
    return title;
  }

  /**
   * Set the title of the item.
   *
   * @param title the title of the item
   */
  public void setTitle(String title) {
    this.title = title;
  }

  /**
   * Get the description of the item.
   *
   * @return the description of the item
   */
  public String getDescription() {
    return description;
  }

  /**
   * Set the description of the item.
   *
   * @param description the description of the item
   */
  public void setDescription(String description) {
    this.description = description;
  }

  /**
   * Get the category of the item.
   *
   * @return the category of the item
   */
  public Category getCategory() {
    return category;
  }

  /**
   * Set the category of the item.
   *
   * @param category the category of the item
   */
  public void setCategory(Category category) {
    this.category = category;
  }

  /**
   * Get the price of the item.
   *
   * @return the price of the item
   */
  public Double getPrice() {
    return price;
  }

  /**
   * Set the price of the item.
   *
   * @param price the price of the item
   */
  public void setPrice(Double price) {
    this.price = price;
  }

  /**
   * Get the published date of the item.
   *
   * @return the published date of the item
   */
  public LocalDateTime getPublishedDate() {
    return publishedDate;
  }

  /**
   * Set the published date of the item.
   *
   * @param publishedDate the published date of the item
   */
  public void setPublishedDate(LocalDateTime publishedDate) {
    this.publishedDate = publishedDate;
  }

  /**
   * Get the latitude of the item.
   *
   * @return the latitude of the item
   */
  public BigDecimal getLatitude() {
    return latitude;
  }

  /**
   * Set the latitude of the item.
   *
   * @param latitude the latitude of the item
   */
  public void setLatitude(BigDecimal latitude) {
    this.latitude = latitude;
  }

  /**
   * Get the longitude of the item.
   *
   * @return the longitude of the item
   */
  public BigDecimal getLongitude() {
    return longitude;
  }

  /**
   * Set the longitude of the item.
   *
   * @param longitude the longitude of the item
   */
  public void setLongitude(BigDecimal longitude) {
    this.longitude = longitude;
  }

  /**
   * Get the status of the item.
   *
   * @return the status of the item
   */
  public ItemStatus getStatus() {
    return status;
  }

  /**
   * Set the status of the item.
   *
   * @param status the status of the item
   */
  public void setStatus(ItemStatus status) {
    this.status = status;
  }

  /**
   * Get the images of the item.
   *
   * @return the images of the item
   */
  public List<Image> getImages() {
    return images;
  }

  /**
   * Set the images of the item.
   *
   * @param images the images of the item
   */
  public void setImages(List<Image> images) {
    this.images = images;
  }

  /**
   * Add an image to the item.
   *
   * @param image the image to add
   */
  public void addImage(Image image) {
    images.add(image);
    image.setItem(this);
  }
}
