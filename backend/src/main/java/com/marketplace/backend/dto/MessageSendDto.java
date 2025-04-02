package com.marketplace.backend.dto;

/**
 * DTO for sending messages.
 */
public class MessageSendDto {
  private Long receiverId;
  private Long itemId;
  private String messageText;

  /**
   * Default constructor.
   */
  public MessageSendDto() {}

  /**
   * Get the ID of the receiver of the message.
   *
   * @return the ID of the receiver of the message
   */
  public Long getReceiverId() {
    return receiverId;
  }

  /**
   * Set the ID of the receiver of the message.
   *
   * @param receiverId the ID of the receiver of the message
   */
  public void setReceiverId(Long receiverId) {
    this.receiverId = receiverId;
  }

  /**
   * Get the ID of the item the message is about.
   *
   * @return the ID of the item the message is about
   */
  public Long getItemId() {
    return itemId;
  }

  /**
   * Set the ID of the item the message is about.
   *
   * @param itemId the ID of the item the message is about
   */
  public void setItemId(Long itemId) {
    this.itemId = itemId;
  }

  /**
   * Get the text of the message.
   *
   * @return the text of the message
   */
  public String getMessageText() {
    return messageText;
  }

  /**
   * Set the text of the message.
   *
   * @param messageText the text of the message
   */
  public void setMessageText(String messageText) {
    this.messageText = messageText;
  }
}
