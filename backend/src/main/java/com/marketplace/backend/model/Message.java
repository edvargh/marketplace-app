package com.marketplace.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Model for a message.
 */
@Entity
@Table(name = "Messages")
public class Message {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "sender_id")
  private User sender;

  @ManyToOne(optional = false)
  @JoinColumn(name = "receiver_id")
  private User receiver;

  @ManyToOne(optional = false)
  @JoinColumn(name = "item_id")
  private Item item;

  @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
  private String messageText;

  @Column(name = "sent_at", nullable = false)
  private LocalDateTime sentAt;

  @Column(name = "is_reservation_request", nullable = false)
  private boolean isReservationRequest = false;

  @Enumerated(EnumType.STRING)
  @Column(name = "reservation_status")
  private ReservationStatus reservationStatus;



  /**
   * Default constructor.
   */
  public Message() {
  }

  /**
   * Constructor with all fields.
   *
   * @param sender      the user who sent the message
   * @param receiver    the user who received the message
   * @param item        the item the message is about
   * @param messageText the text of the message
   * @param sentAt      the time the message was sent
   */
  public Message(User sender, User receiver, Item item, String messageText, LocalDateTime sentAt) {
    this.sender = sender;
    this.receiver = receiver;
    this.item = item;
    this.messageText = messageText;
    this.sentAt = sentAt;
  }

  /**
   * Get the ID of the message.
   *
   * @return the ID of the message
   */
  public Long getId() {
    return id;
  }

  /**
   * Set the ID of the message.
   *
   * @param id the ID of the message
   */
  public void setId(Long id) {
    this.id = id;
  }

  /**
   * Get the user who sent the message.
   *
   * @return the user who sent the message
   */
  public User getSender() {
    return sender;
  }

  /**
   * Set the user who sent the message.
   *
   * @param sender the user who sent the message
   */
  public void setSender(User sender) {
    this.sender = sender;
  }

  /**
   * Get the user who received the message.
   *
   * @return the user who received the message
   */
  public User getReceiver() {
    return receiver;
  }

  /**
   * Set the user who received the message.
   *
   * @param receiver the user who received the message
   */
  public void setReceiver(User receiver) {
    this.receiver = receiver;
  }

  /**
   * Get the item the message is about.
   *
   * @return the item the message is about
   */
  public Item getItem() {
    return item;
  }

  /**
   * Set the item the message is about.
   *
   * @param item the item the message is about
   */
  public void setItem(Item item) {
    this.item = item;
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
