package com.marketplace.backend.model;

import jakarta.persistence.*;

/**
 * Model for a user.
 */
@Entity
@Table(name = "users") // Make sure this matches your actual table name
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "full_name", nullable = false)
  private String fullName;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String password;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role = Role.USER;

  @Column(name = "phone_number")
  private String phoneNumber;

  /**
   * Default constructor.
   */
  public User() {
  }

  /**
   * Constructor with all fields.
   *
   * @param fullName    the full name of the user
   * @param email       the email of the user
   * @param password    the password of the user
   * @param role        the role of the user
   * @param phoneNumber the phone number of the user
   */
  public User(String fullName, String email, String password, Role role, String phoneNumber) {
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.role = role;
    this.phoneNumber = phoneNumber;
  }

  /**
   * Get the user id.
   *
   * @return the user id
   */
  public Long getId() {
    return id;
  }

  /**
   * Set the user id.
   *
   * @param id the user id
   */
  public void setId(Long id) {
    this.id = id;
  }

  /**
   * Get the full name of the user.
   *
   * @return the full name of the user
   */
  public String getFullName() {
    return fullName;
  }

  /**
   * Set the full name of the user.
   *
   * @param fullName the full name of the user
   */
  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  /**
   * Get the email of the user.
   *
   * @return the email of the user
   */
  public String getEmail() {
    return email;
  }

  /**
   * Set the email of the user.
   *
   * @param email the email of the user
   */
  public void setEmail(String email) {
    this.email = email;
  }

  /**
   * Get the password of the user.
   *
   * @return the password of the user
   */
  public String getPassword() {
    return password;
  }

  /**
   * Set the password of the user.
   *
   * @param password the password of the user
   */
  public void setPassword(String password) {
    this.password = password;
  }

  /**
   * Get the role of the user.
   *
   * @return the role of the user
   */
  public Role getRole() {
    return role;
  }

  /**
   * Set the role of the user.
   *
   * @param role the role of the user
   */
  public void setRole(Role role) {
    this.role = role;
  }

  /**
   * Get the phone number of the user.
   *
   * @return the phone number of the user
   */
  public String getPhoneNumber() {
    return phoneNumber;
  }

  /**
   * Set the phone number of the user.
   *
   * @param phoneNumber the phone number of the user
   */
  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }
}
