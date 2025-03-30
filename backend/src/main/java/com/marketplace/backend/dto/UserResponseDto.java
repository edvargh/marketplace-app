package com.marketplace.backend.dto;

/**
 * DTO for user responses.
 */
public class UserResponseDto {
  private Long id;
  private String fullName;
  private String email;
  private String phoneNumber;
  private String profilePicture;
  private String preferredLanguage;
  private String role;

  /**
   * Default constructor.
   */
  public UserResponseDto() {}

  /**
   * Constructor for UserResponseDto.
   *
   * @param id the user ID
   * @param fullName the full name of the user
   * @param email the email of the user
   * @param phoneNumber the phone number of the user
   * @param profilePicture the profile picture of the user
   * @param preferredLanguage the preferred language of the user
   * @param role the role of the user
   */
  public UserResponseDto(Long id, String fullName, String email, String phoneNumber,
                         String profilePicture, String preferredLanguage, String role) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.profilePicture = profilePicture;
    this.preferredLanguage = preferredLanguage;
    this.role = role;
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

  /**
   * Get the profile picture of the user.
   *
   * @return the profile picture of the user
   */
  public String getProfilePicture() {
    return profilePicture;
  }

  /**
   * Set the profile picture of the user.
   *
   * @param profilePicture the profile picture of the user
   */
  public void setProfilePicture(String profilePicture) {
    this.profilePicture = profilePicture;
  }

  /**
   * Get the preferred language of the user.
   *
   * @return the preferred language of the user
   */
  public String getPreferredLanguage() {
    return preferredLanguage;
  }

  /**
   * Set the preferred language of the user.
   *
   * @param preferredLanguage the preferred language of the user
   */
  public void setPreferredLanguage(String preferredLanguage) {
    this.preferredLanguage = preferredLanguage;
  }

  /**
   * Get the role of the user.
   *
   * @return the role of the user
   */
  public String getRole() {
    return role;
  }

  /**
   * Set the role of the user.
   *
   * @param role the role of the user
   */
  public void setRole(String role) {
    this.role = role;
  }

  /**
   * Convert a User entity to a UserResponseDto.
   *
   * @param user the user entity
   * @return the user response DTO
   */
  public static UserResponseDto fromEntity(com.marketplace.backend.model.User user) {
    if (user == null) return null;

    return new UserResponseDto(
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getPhoneNumber(),
        user.getProfilePicture(),
        user.getPreferredLanguage(),
        user.getRole().name()
    );
  }
}