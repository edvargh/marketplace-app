package com.marketplace.backend.model;

import jakarta.persistence.*;

/**
 * Model for a user.
 */
@Entity
@Table(name = "Users")
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

  @Column(name = "profile_picture")
  private String profilePicture; // URL to Cloudinary or other external image host

  @Column(name = "preferred_language", nullable = false)
  private String preferredLanguage = "english";

  public User() {
  }

  public User(String fullName, String email, String password, Role role, String phoneNumber,
              String profilePicture, String preferredLanguage) {
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.role = role;
    this.phoneNumber = phoneNumber;
    this.profilePicture = profilePicture;
    this.preferredLanguage = preferredLanguage != null ? preferredLanguage : "english";
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getFullName() {
    return fullName;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Role getRole() {
    return role;
  }

  public void setRole(Role role) {
    this.role = role;
  }

  public String getPhoneNumber() {
    return phoneNumber;
  }

  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  public String getProfilePicture() {
    return profilePicture;
  }

  public void setProfilePicture(String profilePicture) {
    this.profilePicture = profilePicture;
  }

  public String getPreferredLanguage() {
    return preferredLanguage;
  }

  public void setPreferredLanguage(String preferredLanguage) {
    this.preferredLanguage = preferredLanguage;
  }
}
