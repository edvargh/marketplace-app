package com.marketplace.backend.service;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.ItemStatus;
import com.marketplace.backend.model.Order;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.OrderRepository;
import com.marketplace.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service for handling payment-related operations with Vipps.
 */
@Service
public class PaymentService {

  @Value("${vipps.client-id}")
  private String clientId;

  @Value("${vipps.client-secret}")
  private String clientSecret;

  @Value("${vipps.subscription-key}")
  private String subscriptionKey;

  @Value("${vipps.merchant-serial-number}")
  private String merchantSerialNumber;

  @Value("${vipps.base-url}")
  private String vippsBaseUrl;

  private final UserRepository userRepository;
  private final ItemRepository itemRepository;
  private final OrderRepository orderRepository;
  private final RestTemplate restTemplate = new RestTemplate();

  /**
   * Constructor for PaymentService.
   *
   * @param userRepository    the repository for handling user entities
   * @param itemRepository    the repository for handling item entities
   * @param orderRepository   the repository for handling order entities
   */
  public PaymentService(UserRepository userRepository, ItemRepository itemRepository, OrderRepository orderRepository) {
    this.userRepository = userRepository;
    this.itemRepository = itemRepository;
    this.orderRepository = orderRepository;
  }

  /**
   * Initiates a payment with Vipps.
   *
   * @param orderId          the ID of the order
   * @param amount           the amount to be paid
   * @param userPhoneNumber  the phone number of the user
   * @param callbackPrefix   the callback URL prefix
   * @param fallBackUrl      the fallback URL
   * @return the payment URL for redirection
   */
  public String initiatePayment(String orderId, double amount, String userPhoneNumber, String callbackPrefix, String fallBackUrl) {
    String accessToken;
    try {
      accessToken = fetchAccessToken();
    } catch (Exception e) {
      e.printStackTrace();
      throw e;
    }

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(accessToken);
    headers.set("Ocp-Apim-Subscription-Key", subscriptionKey);
    headers.set("Merchant-Serial-Number", merchantSerialNumber);

    Map<String, Object> body = Map.of(
        "merchantInfo", Map.of(
            "merchantSerialNumber", merchantSerialNumber,
            "callbackPrefix", callbackPrefix,
            "fallBack", fallBackUrl,
            "consentRemovalPrefix", fallBackUrl
        ),
        "transaction", Map.of(
            "orderId", orderId,
            "amount", (int) (amount * 100),
            "transactionText", "Purchase on marketplace"
        ),
        "customerInfo", Map.of(
            "mobileNumber", userPhoneNumber
        )
    );

    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

    try {
      ResponseEntity<Map> response = restTemplate.postForEntity(
          vippsBaseUrl + "/ecomm/v2/payments",
          request,
          Map.class
      );

      if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
        throw new RuntimeException("Vipps API error: " + response.getStatusCode());
      }

      Object url = response.getBody().get("url");
      if (url == null) {
        throw new RuntimeException("Missing payment URL from Vipps response.");
      }

      return url.toString();
    } catch (Exception e) {
      throw new RuntimeException("Failed to initiate Vipps payment: " + e.getMessage(), e);
    }
  }

  /**
   * Fetches an access token from Vipps.
   *
   * @return the access token
   */
  private String fetchAccessToken() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBasicAuth(clientId, clientSecret);
    headers.set("client_id", clientId);
    headers.set("client_secret", clientSecret);
    headers.set("Ocp-Apim-Subscription-Key", subscriptionKey);
    headers.set("Merchant-Serial-Number", merchantSerialNumber);

    HttpEntity<Void> request = new HttpEntity<>(null, headers);

    try {
      ResponseEntity<Map> response = restTemplate.exchange(
          vippsBaseUrl + "/accesstoken/get",
          HttpMethod.POST,
          request,
          Map.class
      );

      if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
        throw new RuntimeException("Failed to fetch Vipps token: " + response.getStatusCode());
      }

      Object token = response.getBody().get("access_token");
      if (token == null) {
        throw new RuntimeException("Vipps token response missing 'access_token'");
      }

      return token.toString();
    } catch (Exception e) {
      throw new RuntimeException("Error fetching Vipps access token: " + e.getMessage(), e);
    }
  }

  /**
   * Finalizes the order after receiving a callback from Vipps.
   *
   * @param orderId the ID of the order
   */
  public void finalizeOrderFromVippsCallback(String orderId) {
    String[] parts = orderId.split("-");
    Long itemId = Long.parseLong(parts[1]);
    Long buyerId = Long.parseLong(parts[2]);

    Optional<Item> itemOpt = itemRepository.findById(itemId);
    Optional<User> buyerOpt = userRepository.findById(buyerId);

    if (itemOpt.isEmpty() || buyerOpt.isEmpty()) {
      throw new RuntimeException("Item or buyer not found");
    }

    Item item = itemOpt.get();
    User buyer = buyerOpt.get();

    item.setStatus(ItemStatus.SOLD);
    itemRepository.save(item);

    Order order = new Order();
    order.setItem(item);
    order.setBuyer(buyer);
    order.setSeller(item.getSeller());
    order.setOrderDate(LocalDateTime.now());
    order.setPrice(item.getPrice());

    orderRepository.save(order);
  }

  /**
   * Creates a Vipps payment for an item.
   *
   * @param itemId        the ID of the item
   * @param userEmail     the email of the user
   * @param callbackPrefix the callback URL prefix
   * @param fallBackUrl   the fallback URL
   * @return the payment URL for redirection
   */
  public String createVippsPayment(Long itemId, String userEmail, String callbackPrefix, String fallBackUrl) {
    User user = userRepository.findByEmail(userEmail).orElseThrow();
    Item item = itemRepository.findById(itemId).orElse(null);
    if (item == null) throw new RuntimeException("Item not found");

    if (item.getStatus() == ItemStatus.SOLD || item.getStatus() == ItemStatus.RESERVED) {
      throw new IllegalStateException("Item is not available for purchase.");
    }

    double amount = item.getPrice();
    String orderId = "order-" + itemId + "-" + user.getId() + "-" + System.currentTimeMillis();

    return initiatePayment(orderId, amount, user.getPhoneNumber(), callbackPrefix, fallBackUrl);
  }
}
