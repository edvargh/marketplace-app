package com.marketplace.backend.dto;

import com.marketplace.backend.model.ReservationStatus;

/**
 * DTO for sending messages.
 */
public class MessageSendDto {
  private Long receiverId;
  private Long itemId;
  private String messageText;
  private boolean isReservationRequest;
  private ReservationStatus reservationStatus;

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

  /**
   * Get whether the message is a reservation request.
   *
   * @return whether the message is a reservation request
   */
  public boolean isReservationRequest() {
    return isReservationRequest;
  }

  /**
   * Set whether the message is a reservation request.
   *
   * @param isReservationRequest whether the message is a reservation request
   */
  public void setReservationRequest(boolean isReservationRequest) {
    this.isReservationRequest = isReservationRequest;
  }

  /**
   * Get the reservation status of the message.
   *
   * @return the reservation status of the message
   */
  public ReservationStatus getReservationStatus() {
    return reservationStatus;
  }

  /**
   * Set the reservation status of the message.
   *
   * @param reservationStatus the reservation status of the message
   */
  public void setReservationStatus(ReservationStatus reservationStatus) {
    this.reservationStatus = reservationStatus;
  }
}
