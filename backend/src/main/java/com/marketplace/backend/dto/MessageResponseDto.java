package com.marketplace.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO for message responses.
 */
public class MessageResponseDto {
  private boolean fromYou;
  private String text;
  private LocalDateTime sentAt;

  /**
   * Default constructor.
   */
  public MessageResponseDto() {}

  /**
   * Create a MessageResponseDto.
   *
   * @param fromYou whether the message is from the current user
   * @param text    the message text
   * @param sentAt  the time the message was sent
   */
  public MessageResponseDto(boolean fromYou, String text, LocalDateTime sentAt) {
    this.fromYou = fromYou;
    this.text = text;
    this.sentAt = sentAt;
  }

  /**
   * Get whether the message is from the current user.
   *
   * @return whether the message is from the current user
   */
  public boolean isFromYou() {
    return fromYou;
  }

  /**
   * Set whether the message is from the current user.
   *
   * @param fromYou whether the message is from the current user
   */
  public void setFromYou(boolean fromYou) {
    this.fromYou = fromYou;
  }

  /**
   * Get the message text.
   *
   * @return the message text
   */
  public String getText() {
    return text;
  }

  /**
   * Set the message text.
   *
   * @param text the message text
   */
  public void setText(String text) {
    this.text = text;
  }

  /**
   * Get the time the message was sent.
   *
   * @return the time the message was sent
   */
  public LocalDateTime getSentAt() {
    return sentAt;
  }

  /**
   * Set the time the message was sent.
   *
   * @param sentAt the time the message was sent
   */
  public void setSentAt(LocalDateTime sentAt) {
    this.sentAt = sentAt;
  }
}
