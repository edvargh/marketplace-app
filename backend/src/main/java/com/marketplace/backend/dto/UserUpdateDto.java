package com.marketplace.backend.dto;

/**
 * DTO for updating user data.
 */
public class UserUpdateDto {
  private String fullName;
  private String email;
  private String password;
  private String phoneNumber;
  private String profilePicture;
  private String preferredLanguage;

  /**
   * Get the full name of the user.
   *
   * @return the full name
   */
  public String getFullName() { return fullName; }

  /**
   * Set the full name of the user.
   *
   * @param fullName the full name
   */
  public void setFullName(String fullName) { this.fullName = fullName; }

  /**
   * Get the email of the user.
   *
   * @return the email
   */
  public String getEmail() { return email; }

  /**
   * Set the email of the user.
   *
   * @param email the email
   */
  public void setEmail(String email) { this.email = email; }

  /**
   * Get the password of the user.
   *
   * @return the password
   */
  public String getPassword() { return password; }

  /**
   * Set the password of the user.
   *
   * @param password the password
   */
  public void setPassword(String password) { this.password = password; }

  /**
   * Get the phone number of the user.
   *
   * @return the phone number
   */
  public String getPhoneNumber() { return phoneNumber; }

  /**
   * Set the phone number of the user.
   *
   * @param phoneNumber the phone number
   */
  public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

  /**
   * Get the profile picture of the user.
   *
   * @return the profile picture
   */
  public String getProfilePicture() { return profilePicture; }

  /**
   * Set the profile picture of the user.
   *
   * @param profilePicture the profile picture
   */
  public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

  /**
   * Get the preferred language of the user.
   *
   * @return the preferred language
   */
  public String getPreferredLanguage() { return preferredLanguage; }

  /**
   * Set the preferred language of the user.
   *
   * @param preferredLanguage the preferred language
   */
  public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
}