package com.marketplace.backend.controller;

import com.marketplace.backend.dto.MessageSendDto;
import com.marketplace.backend.dto.MessageResponseDto;
import com.marketplace.backend.model.ReservationStatus;
import com.marketplace.backend.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

/**
 * Controller for handling messaging between users.
 */
@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {
  private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

  private final MessageService messageService;

  public MessageController(MessageService messageService) {
    this.messageService = messageService;
  }

  /**
   * Send a message to another user about an item.
   */
  @PostMapping("/send")
  public ResponseEntity<Void> sendMessage(@RequestBody MessageSendDto dto) {
    logger.info("Sending message to user {} about item {}", dto.getReceiverId(), dto.getItemId());
    try {
      messageService.sendMessage(dto);
      logger.info("Message sent successfully");
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      logger.error("Failed to send message: {}", e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Update the reservation status of a message.
   */
  @PutMapping("/{messageId}/update-reservation-status")
  public ResponseEntity<Void> updateReservationStatus(
      @PathVariable Long messageId,
      @RequestParam ReservationStatus status
  ) {
    logger.info("Updating reservation status of message {} to {}", messageId, status);
    try {
      messageService.updateReservationStatus(messageId, status);
      logger.info("Reservation status updated successfully for message {}", messageId);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      logger.error("Failed to update reservation status for message {}: {}", messageId, e.getMessage(), e);
      throw e;
    }
  }


  /**
   * Send a reservation request message to another user about an item.
   */
  @PostMapping("/send-reservation-request")
  public ResponseEntity<Void> sendReservationRequest(@RequestBody MessageSendDto dto) {
    logger.info("Sending reservation request to user {} for item {}", dto.getReceiverId(), dto.getItemId());
    try {
      messageService.sendReservationRequest(dto);
      logger.info("Reservation request sent successfully");
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      logger.error("Failed to send reservation request: {}", e.getMessage(), e);
      throw e;
    }
  }


  /**
   * Get all messages between the current user and another user for a specific item.
   */
  @GetMapping("/conversation")
  public ResponseEntity<List<MessageResponseDto>> getConversation(
      @RequestParam Long itemId,
      @RequestParam Long withUserId
  ) {
    logger.info("Fetching conversation for item {} with user {}", itemId, withUserId);
    try {
      List<MessageResponseDto> messages = messageService.getMessagesWithUserForItem(withUserId, itemId);
      return ResponseEntity.ok(messages);
    } catch (Exception e) {
      logger.error("Failed to fetch conversation: {}", e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Get all conversations the current user is involved in.
   */
  @GetMapping("/conversations")
  public ResponseEntity<List<Map<String, Object>>> getAllConversations() {
    logger.info("Fetching all conversations for current user");
    try {
      List<Map<String, Object>> conversations = messageService.getConversationsForCurrentUser();
      return ResponseEntity.ok(conversations);
    } catch (Exception e) {
      logger.error("Failed to fetch conversations: {}", e.getMessage(), e);
      throw e;
    }
  }
}
