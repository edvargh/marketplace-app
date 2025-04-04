package com.marketplace.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Model for an item view.
 */
@Entity
@Table(name = "ItemViews")
public class ItemView {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne(optional = false)
  @JoinColumn(name = "item_id")
  private Item item;

  private LocalDateTime viewedAt = LocalDateTime.now();

  /**
   * Default constructor.
   */
  public ItemView() {
  }

  /**
   * Constructor with all fields.
   *
   * @param user the user who viewed the item
   * @param item the item that was viewed
   */
  public ItemView(User user, Item item) {
      this.user = user;
      this.item = item;
      this.viewedAt = LocalDateTime.now();
  }

  /**
   * Get the ID of the item view.
   *
   * @return the ID of the item view
   */
  public Integer getId() {
      return id;
  }

  /**
   * Set the ID of the item view.
   *
   * @param id the ID of the item view
   */
  public void setId(Integer id) {
      this.id = id;
  }

  /**
   * Get the user who viewed the item.
   *
   * @return the user who viewed the item
   */
  public User getUser() {
      return user;
  }

  /**
   * Set the user who viewed the item.
   *
   * @param user the user who viewed the item
   */
  public void setUser(User user) {
      this.user = user;
  }

  /**
   * Get the item that was viewed.
   *
   * @return the item that was viewed
   */
  public Item getItem() {
      return item;
  }

  /**
   * Set the item that was viewed.
   *
   * @param item the item that was viewed
   */
  public void setItem(Item item) {
      this.item = item;
  }

  /**
   * Get the date and time when the item was viewed.
   *
   * @return the date and time when the item was viewed
   */
  public LocalDateTime getViewedAt() {
      return viewedAt;
  }

  /**
   * Set the date and time when the item was viewed.
   *
   * @param viewedAt the date and time when the item was viewed
   */
  public void setViewedAt(LocalDateTime viewedAt) {
      this.viewedAt = viewedAt;
  }
}