package com.marketplace.backend.model;

import jakarta.persistence.*;

/**
 * Model for a category.
 */
@Entity
@Table(name = "categories")
public class Category {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  /**
   * Default constructor.
   */
  public Category() {
  }

  /**
   * Constructor with all fields.
   *
   * @param id   the category id
   * @param name the category name
   */
  public Category(Long id, String name) {
    this.id = id;
    this.name = name;
  }

  /**
   * Constructor with name.
   *
   * @param name the category name
   */
  public Category(String name) {
    this.name = name;
  }

  /**
   * Get the category id.
   *
   * @return the category id
   */
  public Long getId() {
    return id;
  }

  /**
   * Set the category id.
   *
   * @param id the category id
   */
  public void setId(Long id) {
    this.id = id;
  }

  /**
   * Get the category name.
   *
   * @return the category name
   */
  public String getName() {
    return name;
  }

  /**
   * Set the category name.
   *
   * @param name the category name
   */
  public void setName(String name) {
    this.name = name;
  }
}
