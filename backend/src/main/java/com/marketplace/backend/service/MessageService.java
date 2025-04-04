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

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for handling message related requests.
 */
@Service
public class MessageService {

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
    User sender = userRepository.findByEmail(email).orElseThrow();
    User receiver = userRepository.findById(dto.getReceiverId()).orElseThrow();
    Item item = itemRepository.findById(dto.getItemId()).orElseThrow();

    if (!item.getSeller().getId().equals(sender.getId()) &&
        !item.getSeller().getId().equals(receiver.getId())) {
      throw new AccessDeniedException("Messages can only be exchanged with the seller of the item.");
    }

    if (sender.getId().equals(receiver.getId())) {
      throw new AccessDeniedException("You cannot send messages to yourself.");
    }

    Message message = new Message(
        sender,
        receiver,
        item,
        dto.getMessageText(),
        LocalDateTime.now()
    );

    messageRepository.save(message);
  }

  /**
   * Send a reservation request message to a user about an item.
   */
  public void sendReservationRequest(MessageSendDto dto) {
    String email = getAuthenticatedEmail();
    User sender = userRepository.findByEmail(email).orElseThrow();
    User receiver = userRepository.findById(dto.getReceiverId()).orElseThrow();
    Item item = itemRepository.findById(dto.getItemId()).orElseThrow();

    if (!item.getSeller().getId().equals(receiver.getId())) {
      throw new AccessDeniedException("Reservation requests can only be sent to the seller of the item.");
    }

    if (sender.getId().equals(receiver.getId())) {
      throw new AccessDeniedException("You cannot send a reservation request to yourself.");
    }

    Message message = new Message(
        sender,
        receiver,
        item,
        dto.getMessageText(),
        LocalDateTime.now()
    );
    message.setReservationRequest(true);
    message.setReservationStatus(ReservationStatus.PENDING);
    messageRepository.save(message);
  }

  public void updateReservationStatus(Long messageId, ReservationStatus status) {
    String email = getAuthenticatedEmail();
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
  }



  /**
   * Get all messages in a specific conversation.
   */
  public List<MessageResponseDto> getMessagesWithUserForItem(Long otherUserId, Long itemId) {
    String email = getAuthenticatedEmail();
    User currentUser = userRepository.findByEmail(email).orElseThrow();
    User otherUser = userRepository.findById(otherUserId).orElseThrow();
    Item item = itemRepository.findById(itemId).orElseThrow();

    List<Message> messages = messageRepository
        .findByItemAndSenderAndReceiverOrItemAndSenderAndReceiverOrderBySentAt(
            item, currentUser, otherUser,
            item, otherUser, currentUser
        );

    return messages.stream()
        .map(msg -> new MessageResponseDto(
            msg.getSender().getId().equals(currentUser.getId()),
            msg.getMessageText(),
            msg.getSentAt(),
            msg.isReservationRequest(),
            msg.getReservationStatus()
        ))
        .collect(Collectors.toList());
  }

  /**
   * Get all conversations for the current user.
   * Each conversation is defined by (itemId + other user).
   */
  public List<Map<String, Object>> getConversationsForCurrentUser() {
    String email = getAuthenticatedEmail();
    User currentUser = userRepository.findByEmail(email).orElseThrow();

    List<Message> allMessages = messageRepository.findBySenderOrReceiver(currentUser, currentUser);

    Map<String, Message> latestMessages = new HashMap<>();

    for (Message msg : allMessages) {
      User other = msg.getSender().equals(currentUser) ? msg.getReceiver() : msg.getSender();
      String key = msg.getItem().getId() + "-" + other.getId();

      if (!latestMessages.containsKey(key) ||
          msg.getSentAt().isAfter(latestMessages.get(key).getSentAt())) {
        latestMessages.put(key, msg);
      }
    }

    return latestMessages.values().stream()
        .map(msg -> {
          User other = msg.getSender().equals(currentUser) ? msg.getReceiver() : msg.getSender();
          Map<String, Object> convo = new HashMap<>();
          convo.put("itemId", msg.getItem().getId());
          convo.put("itemTitle", msg.getItem().getTitle());
          convo.put("withUserId", other.getId());
          convo.put("withUserName", other.getFullName());
          convo.put("lastMessage", msg.getMessageText());
          convo.put("lastSentAt", msg.getSentAt());
          return convo;
        })
        .sorted(Comparator.comparing(map -> (LocalDateTime) map.get("lastSentAt"), Comparator.reverseOrder()))
        .collect(Collectors.toList());
  }

  /**
   * Get the email of the authenticated user.
   */
  private String getAuthenticatedEmail() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication.getName();
  }
}
