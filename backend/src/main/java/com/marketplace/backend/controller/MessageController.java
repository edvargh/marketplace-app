package com.marketplace.backend.controller;

import com.marketplace.backend.dto.MessageSendDto;
import com.marketplace.backend.dto.MessageResponseDto;
import com.marketplace.backend.model.ReservationStatus;
import com.marketplace.backend.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for handling messaging between users.
 */
@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

  private final MessageService messageService;

  public MessageController(MessageService messageService) {
    this.messageService = messageService;
  }

  /**
   * Send a message to another user about an item.
   */
  @PostMapping("/send")
  public ResponseEntity<Void> sendMessage(@RequestBody MessageSendDto dto) {
    messageService.sendMessage(dto);
    return ResponseEntity.ok().build();
  }

  /**
   * Update the reservation status of a message.
   */
  @PutMapping("/{messageId}/update-reservation-status")
  public ResponseEntity<Void> updateReservationStatus(
      @PathVariable Long messageId,
      @RequestParam ReservationStatus status
  ) {
    messageService.updateReservationStatus(messageId, status);
    return ResponseEntity.ok().build();
  }


  /**
   * Send a reservation request message to another user about an item.
   */
  @PostMapping("/send-reservation-request")
  public ResponseEntity<Void> sendReservationRequest(@RequestBody MessageSendDto dto) {
    messageService.sendReservationRequest(dto);
    return ResponseEntity.ok().build();
  }


  /**
   * Get all messages between the current user and another user for a specific item.
   */
  @GetMapping("/conversation")
  public ResponseEntity<List<MessageResponseDto>> getConversation(
      @RequestParam Long itemId,
      @RequestParam Long withUserId
  ) {
    List<MessageResponseDto> messages = messageService.getMessagesWithUserForItem(withUserId, itemId);
    return ResponseEntity.ok(messages);
  }

  /**
   * Get all conversations the current user is involved in.
   */
  @GetMapping("/conversations")
  public ResponseEntity<List<Map<String, Object>>> getAllConversations() {
    List<Map<String, Object>> conversations = messageService.getConversationsForCurrentUser();
    return ResponseEntity.ok(conversations);
  }
}
