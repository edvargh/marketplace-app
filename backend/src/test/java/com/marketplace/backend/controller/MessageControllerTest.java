package com.marketplace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.backend.model.*;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.MessageRepository;
import com.marketplace.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests for the MessageController.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(locations = "classpath:application-test.properties")
class MessageControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private EntityManager entityManager;
  @Autowired private UserRepository userRepository;
  @Autowired private ItemRepository itemRepository;
  @Autowired private MessageRepository messageRepository;

  private User seller;
  private User buyer;
  private Item item;

  /**
   * Set up test data.
   */
  @BeforeEach
  void setUp() {
    messageRepository.deleteAll();
    itemRepository.deleteAll();
    userRepository.deleteAll();

    seller = new User("Seller", "seller@example.com", "pw", Role.USER, "123", null, "english");
    buyer = new User("Buyer", "buyer@example.com", "pw", Role.USER, "456", null, "english");
    seller = userRepository.save(seller);
    buyer = userRepository.save(buyer);

    item = new Item(seller, "Bike", "Nice bike", null, 500.0,
        LocalDateTime.now(), new BigDecimal("63.0"), new BigDecimal("10.0"));
    item = itemRepository.save(item);
  }

  /**
   * Test sending a message to the seller.
   */
  @Test
  @WithMockUser(username = "buyer@example.com")
  void shouldSendMessageToSeller() throws Exception {
    String body = """
        {
          "receiverId": %d,
          "itemId": %d,
          "messageText": "Hi, is this still available?"
        }
        """.formatted(seller.getId(), item.getId());

    mockMvc.perform(post("/api/messages/send")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isOk());
  }

  /**
   * Test sending a reservation request to the seller.
   */
  @Test
  @WithMockUser(username = "buyer@example.com")
  void shouldSendReservationRequest() throws Exception {
    String body = """
      {
        "receiverId": %d,
        "itemId": %d,
        "messageText": "Can you reserve this for me?",
        "isReservationRequest": true
      }
      """.formatted(seller.getId(), item.getId());

    mockMvc.perform(post("/api/messages/send-reservation-request")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isOk());

    List<Message> messages = messageRepository.findAll();
    assert messages.size() == 1;
    assert messages.get(0).isReservationRequest();
    assert messages.get(0).getReservationStatus() == ReservationStatus.PENDING;
  }

  /**
   * Test updating the reservation status of a reservation request.
   */
  @Test
  @WithMockUser(username = "seller@example.com")
  void shouldUpdateReservationStatus() throws Exception {
    Message reservationRequest = new Message(
        buyer, seller, item, "Can you reserve this?", LocalDateTime.now());
    reservationRequest.setReservationRequest(true);
    reservationRequest.setReservationStatus(ReservationStatus.PENDING);
    reservationRequest = messageRepository.save(reservationRequest);

    mockMvc.perform(put("/api/messages/" + reservationRequest.getId() + "/update-reservation-status")
            .param("status", "ACCEPTED"))
        .andExpect(status().isOk());

    Message updatedMessage = messageRepository.findById(reservationRequest.getId()).orElseThrow();
    assert updatedMessage.getReservationStatus() == ReservationStatus.ACCEPTED;
  }


  /**
   * Test sending a message to the seller.
   */
  @Test
  @WithMockUser(username = "buyer@example.com")
  void shouldRejectMessageIfReceiverIsNotSeller() throws Exception {
    User random = userRepository.save(new User("Other", "random@example.com", "pw", Role.USER, "789", null, "english"));

    String body = """
        {
          "receiverId": %d,
          "itemId": %d,
          "messageText": "Invalid attempt"
        }
        """.formatted(random.getId(), item.getId());

    mockMvc.perform(post("/api/messages/send")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isForbidden());
  }

  /**
   * Test sending a message to the seller.
   */
  @Test
  @WithMockUser(username = "buyer@example.com")
  void shouldGetMessagesInConversation() throws Exception {
    messageRepository.save(new Message(buyer, seller, item, "Hello!", LocalDateTime.now()));

    mockMvc.perform(get("/api/messages/conversation")
            .param("itemId", String.valueOf(item.getId()))
            .param("withUserId", String.valueOf(seller.getId())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].text").value("Hello!"))
        .andExpect(jsonPath("$[0].fromYou").value(true));
  }

  /**
   * Test getting all conversations for the current user.
   */
  @Test
  @WithMockUser(username = "buyer@example.com")
  void shouldGetAllConversationsForUser() throws Exception {
    messageRepository.save(new Message(buyer, seller, item, "Hi there", LocalDateTime.now()));

    mockMvc.perform(get("/api/messages/conversations"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].itemId").value(item.getId()))
        .andExpect(jsonPath("$[0].withUserId").value(seller.getId()))
        .andExpect(jsonPath("$[0].itemTitle").value("Bike"))
        .andExpect(jsonPath("$[0].lastMessage").value("Hi there"));
  }
}
