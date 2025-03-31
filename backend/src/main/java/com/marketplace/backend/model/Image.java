package com.marketplace.backend.model;

import jakarta.persistence.*;

/**
 * Model representing an image associated with an item.
 */
@Entity
@Table(name = "ItemPictures")
public class Image {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "item_id", nullable = false)
  private Item item;

  @Column(name = "image_url", nullable = false)
  private String imageUrl;

  /**
   * Default constructor.
   */
  public Image() {}

  /**
   * Constructor with fields.
   *
   * @param item the associated item
   * @param imageUrl the Cloudinary image URL
   */
  public Image(Item item, String imageUrl) {
    this.item = item;
    this.imageUrl = imageUrl;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Item getItem() {
    return item;
  }

  public void setItem(Item item) {
    this.item = item;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }
}
