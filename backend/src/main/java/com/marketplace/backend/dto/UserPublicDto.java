package com.marketplace.backend.dto;

import com.marketplace.backend.model.User;

/**
 * DTO for public user information.
 */
public class UserPublicDto {
  private Long id;
  private String fullName;
  private String profilePicture;

  /**
   * Default constructor.
   */
  public UserPublicDto(Long id, String fullName, String profilePicture) {
    this.id = id;
    this.fullName = fullName;
    this.profilePicture = profilePicture;
  }

  /**
   * Create a UserPublicDto from a User entity.
   *
   * @param user the user entity
   * @return the UserPublicDto
   */
  public static UserPublicDto fromEntity(User user) {
    return new UserPublicDto(
        user.getId(),
        user.getFullName(),
        user.getProfilePicture()
    );
  }

  /**
   * Get the user ID.
   *
   * @return the user ID
   */
  public Long getId() {
    return id;
  }

  /**
   * Set the user ID.
   *
   * @param id the user ID
   */
  public void setId(Long id) {
    this.id = id;
  }

  /**
   * Get the full name of the user.
   *
   * @return the full name
   */
  public String getFullName() {
    return fullName;
  }

  /**
   * Set the full name of the user.
   *
   * @param fullName the full name
   */
  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  /**
   * Get the profile picture URL of the user.
   *
   * @return the profile picture URL
   */
  public String getProfilePicture() {
    return profilePicture;
  }
}


