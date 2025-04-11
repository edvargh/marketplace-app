package com.marketplace.backend.service;

import com.marketplace.backend.dto.MessageSendDto;
import com.marketplace.backend.dto.MessageResponseDto;
import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.Message;
import com.marketplace.backend.model.ReservationStatus;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.MessageRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for handling message related requests.
 */
@Service
public class MessageService {
  private static final Logger logger = LoggerFactory.getLogger(MessageService.class);

  private final MessageRepository messageRepository;
  private final UserRepository userRepository;
  private final ItemRepository itemRepository;

  /**
   * Constructor for MessageService.
   *
   * @param messageRepository the repository for handling message entities
   * @param userRepository     the repository for handling user entities
   * @param itemRepository     the repository for handling item entities
   */
  public MessageService(MessageRepository messageRepository, UserRepository userRepository, ItemRepository itemRepository) {
    this.messageRepository = messageRepository;
    this.userRepository = userRepository;
    this.itemRepository = itemRepository;
  }

  /**
   * Send a message to a user about an item.
   */
  public void sendMessage(MessageSendDto dto) {
    String email = getAuthenticatedEmail();
    logger.info("Sending message from {} to user {} about item {}", email, dto.getReceiverId(), dto.getItemId());
    try {
      User sender = userRepository.findByEmail(email).orElseThrow();
      User receiver = userRepository.findById(dto.getReceiverId()).orElseThrow();
      Item item = itemRepository.findById(dto.getItemId()).orElseThrow();

      if (!item.getSeller().getId().equals(sender.getId()) && !item.getSeller().getId().equals(receiver.getId())) {
        throw new AccessDeniedException("Messages can only be exchanged with the seller of the item.");
      }

      if (sender.getId().equals(receiver.getId())) {
        throw new AccessDeniedException("You cannot send messages to yourself.");
      }

      Message message = new Message(sender, receiver, item, dto.getMessageText(), LocalDateTime.now());
      messageRepository.save(message);
      logger.info("Message successfully sent from {} to {} about item {}", sender.getId(), receiver.getId(), item.getId());
    } catch (Exception e) {
      logger.error("Failed to send message: {}", e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Send a reservation request message to a user about an item.
   */
  public void sendReservationRequest(MessageSendDto dto) {
    String email = getAuthenticatedEmail();
    logger.info("Sending reservation request from {} to {} for item {}", email, dto.getReceiverId(), dto.getItemId());
    try {
      User sender = userRepository.findByEmail(email).orElseThrow();
      User receiver = userRepository.findById(dto.getReceiverId()).orElseThrow();
      Item item = itemRepository.findById(dto.getItemId()).orElseThrow();

      if (!item.getSeller().getId().equals(receiver.getId())) {
        throw new AccessDeniedException("Reservation requests can only be sent to the seller of the item.");
      }

      if (sender.getId().equals(receiver.getId())) {
        throw new AccessDeniedException("You cannot send a reservation request to yourself.");
      }

      Message message = new Message(sender, receiver, item, dto.getMessageText(), LocalDateTime.now());
      message.setReservationRequest(true);
      message.setReservationStatus(ReservationStatus.PENDING);
      messageRepository.save(message);
      logger.info("Reservation request sent successfully from {} to {} for item {}", sender.getId(), receiver.getId(), item.getId());
    } catch (Exception e) {
      logger.error("Failed to send reservation request: {}", e.getMessage(), e);
      throw e;
    }
  }

  public void updateReservationStatus(Long messageId, ReservationStatus status) {
    String email = getAuthenticatedEmail();
    logger.info("Updating reservation status of message {} to {} by user {}", messageId, status, email);
    try {
      User currentUser = userRepository.findByEmail(email).orElseThrow();
      Message message = messageRepository.findById(messageId).orElseThrow();

      if (!message.isReservationRequest()) {
        throw new IllegalArgumentException("This message is not a reservation request.");
      }

      if (!message.getReceiver().getId().equals(currentUser.getId())) {
        throw new AccessDeniedException("Only the receiver can update the reservation status.");
      }

      message.setReservationStatus(status);
      messageRepository.save(message);
      logger.info("Reservation status of message {} updated to {}", messageId, status);
    } catch (Exception e) {
      logger.error("Failed to update reservation status for message {}: {}", messageId, e.getMessage(), e);
      throw e;
    }
  }



  /**
   * Get all messages in a specific conversation.
   */
  public List<MessageResponseDto> getMessagesWithUserForItem(Long otherUserId, Long itemId) {
    String email = getAuthenticatedEmail();
    logger.info("Fetching messages for item {} with user {} by user {}", itemId, otherUserId, email);
    try {
      User currentUser = userRepository.findByEmail(email).orElseThrow();
      User otherUser = userRepository.findById(otherUserId).orElseThrow();
      Item item = itemRepository.findById(itemId).orElseThrow();

      List<Message> messages = messageRepository
          .findByItemAndSenderAndReceiverOrItemAndSenderAndReceiverOrderBySentAt(
              item, currentUser, otherUser,
              item, otherUser, currentUser
          );

      logger.debug("Found {} messages for item {} between user {} and {}", messages.size(), itemId, currentUser.getId(), otherUserId);

      return messages.stream()
          .map(msg -> new MessageResponseDto(
              msg.getId(),
              msg.getSender().getId().equals(currentUser.getId()),
              msg.getMessageText(),
              msg.getSentAt(),
              msg.isReservationRequest(),
              msg.getReservationStatus()
          ))
          .collect(Collectors.toList());
    } catch (Exception e) {
      logger.error("Failed to fetch messages for item {}: {}", itemId, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Get all conversations for the current user.
   * Each conversation is defined by (itemId + other user).
   */
  public List<Map<String, Object>> getConversationsForCurrentUser() {
    String email = getAuthenticatedEmail();
    logger.info("Fetching all conversations for user {}", email);
    try {
      User currentUser = userRepository.findByEmail(email).orElseThrow();
      List<Message> allMessages = messageRepository.findBySenderOrReceiver(currentUser, currentUser);

      Map<String, Message> latestMessages = new HashMap<>();

      for (Message msg : allMessages) {
        User other = msg.getSender().equals(currentUser) ? msg.getReceiver() : msg.getSender();
        String key = msg.getItem().getId() + "-" + other.getId();

        if (!latestMessages.containsKey(key) || msg.getSentAt().isAfter(latestMessages.get(key).getSentAt())) {
          latestMessages.put(key, msg);
        }
      }

      List<Map<String, Object>> conversations = latestMessages.values().stream()
          .map(msg -> {
            User other = msg.getSender().equals(currentUser) ? msg.getReceiver() : msg.getSender();
            Map<String, Object> conversation = new HashMap<>();
            conversation.put("itemId", msg.getItem().getId());
            conversation.put("itemTitle", msg.getItem().getTitle());
            conversation.put("withUserId", other.getId());
            conversation.put("withUserName", other.getFullName());
            conversation.put("lastMessage", msg.getMessageText());
            conversation.put("lastSentAt", msg.getSentAt());
            return conversation;
          })
          .sorted(Comparator.comparing(map -> (LocalDateTime) map.get("lastSentAt"), Comparator.reverseOrder()))
          .collect(Collectors.toList());

      logger.debug("Found {} conversations for user {}", conversations.size(), email);
      return conversations;
    } catch (Exception e) {
      logger.error("Failed to fetch conversations for user {}: {}", email, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Get the email of the authenticated user.
   */
  private String getAuthenticatedEmail() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication.getName();
  }
}
