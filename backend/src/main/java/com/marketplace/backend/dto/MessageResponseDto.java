package com.marketplace.backend.dto;

import com.marketplace.backend.model.ReservationStatus;
import java.time.LocalDateTime;

/**
 * DTO for message responses.
 */
public class MessageResponseDto {
  private boolean fromYou;
  private String text;
  private LocalDateTime sentAt;
  private boolean isReservationRequest;
  private ReservationStatus reservationStatus;

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
  public MessageResponseDto(boolean fromYou, String text, LocalDateTime sentAt,
                            boolean isReservationRequest, ReservationStatus reservationStatus) {
    this.fromYou = fromYou;
    this.text = text;
    this.sentAt = sentAt;
    this.isReservationRequest = isReservationRequest;
    this.reservationStatus = reservationStatus;
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
   * @param reservationRequest whether the message is a reservation request
   */
  public void setReservationRequest(boolean reservationRequest) {
    isReservationRequest = reservationRequest;
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
