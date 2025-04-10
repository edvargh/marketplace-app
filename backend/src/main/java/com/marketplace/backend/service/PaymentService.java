package com.marketplace.backend.service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.ItemStatus;
import com.marketplace.backend.model.Order;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.OrderRepository;
import com.marketplace.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

  private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

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
  private final ConcurrentMap<String, Boolean> paymentStatusMap = new ConcurrentHashMap<>();

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
    logger.info("Initiating payment for order {} with amount {} NOK", orderId, amount);

    String accessToken;
    try {
      accessToken = fetchAccessToken();
      logger.debug("Successfully fetched access token for order {}", orderId);
    } catch (Exception e) {
      logger.error("Failed to fetch access token for order {}: {}", orderId, e.getMessage(), e);
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

      if (!response.getStatusCode().is2xxSuccessful()) {
        logger.error("Vipps API error during payment initiation for order {}: {}", orderId, response.getStatusCode());
        throw new RuntimeException("Vipps API error: " + response.getStatusCode());
      }


      Object url = response.getBody().get("url");
      if (url == null) {
        logger.error("No payment URL returned from Vipps for order {}", orderId);
        throw new RuntimeException("Missing payment URL from Vipps response.");
      }

      logger.info("Vipps payment URL created for order {}: {}", orderId, url);
      return url.toString();
    } catch (Exception e) {
      logger.error("Failed to initiate Vipps payment for order {}: {}", orderId, e.getMessage(), e);
      throw new RuntimeException("Failed to initiate Vipps payment: " + e.getMessage(), e);
    }
  }

  /**
   * Fetches an access token from Vipps.
   *
   * @return the access token
   */
  private String fetchAccessToken() {
    logger.debug("Fetching Vipps access token...");

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBasicAuth(clientId, clientSecret);
    headers.set("client_id", clientId);
    headers.set("client_secret", clientSecret);
    headers.set("Ocp-Apim-Subscription-Key", subscriptionKey);
    headers.set("Merchant-Serial-Number", merchantSerialNumber);

    HttpEntity<Void> request = new HttpEntity<>(headers);

    try {
      ResponseEntity<Map> response = restTemplate.exchange(
          vippsBaseUrl + "/accesstoken/get",
          HttpMethod.POST,
          request,
          Map.class
      );

      if (!response.getStatusCode().is2xxSuccessful()) {
        logger.error("Failed to fetch Vipps token: {}", response.getStatusCode());
        throw new RuntimeException("Failed to fetch Vipps token: " + response.getStatusCode());
      }

      Object token = response.getBody().get("access_token");
      if (token == null) {
        logger.error("Vipps token response missing 'access_token'");
        throw new RuntimeException("Vipps token response missing 'access_token'");
      }

      return token.toString();
    } catch (Exception e) {
      logger.error("Error fetching Vipps access token: {}", e.getMessage(), e);
      throw new RuntimeException("Error fetching Vipps access token: " + e.getMessage(), e);
    }
  }

  /**
   * Finalizes the order after receiving a callback from Vipps.
   *
   * @param orderId the ID of the order
   */
  public void finalizeOrderFromVippsCallback(String orderId, Map<String, Object> payload) {
    logger.info("Finalizing order from Vipps callback: {}", orderId);

    Map<String, Object> transactionInfo = (Map<String, Object>) payload.get("transactionInfo");
    String status = (String) transactionInfo.get("status");

    logger.debug("Vipps callback status for order {}: {}", orderId, status);

    if (!"SALE".equalsIgnoreCase(status)) {
      logger.warn("Vipps payment status is not 'SALE': {}", status);
      throw new IllegalStateException("Payment not completed, status was: " + status);
    }

    String[] parts = orderId.split("-");
    Long itemId = Long.parseLong(parts[1]);
    Long buyerId = Long.parseLong(parts[2]);

    Optional<Item> itemOpt = itemRepository.findById(itemId);
    Optional<User> buyerOpt = userRepository.findById(buyerId);

    if (itemOpt.isEmpty() || buyerOpt.isEmpty()) {
      logger.error("Item or buyer not found for order {}", orderId);
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
    paymentStatusMap.put(orderId, true);
    logger.info("Order {} finalized successfully", orderId);
  }

  /**
   * Creates a Vipps payment for an item.
   *
   * @param itemId        the ID of the item
   * @param userEmail     the email of the user
   * @return the payment URL for redirection
   */
  public String createVippsPayment(Long itemId, String userEmail) {
    logger.info("Creating Vipps payment for item {} by user {}", itemId, userEmail);

    User user = userRepository.findByEmail(userEmail).orElseThrow(() -> {
      logger.error("User not found with email {}", userEmail);
      return new RuntimeException("User not found");
    });
    Item item = itemRepository.findById(itemId).orElse(null);

    if (item == null) {
      logger.error("Item {} not found", itemId);
      throw new RuntimeException("Item not found");
    }

    if (item.getStatus() == ItemStatus.SOLD || item.getStatus() == ItemStatus.RESERVED) {
      logger.warn("Item {} is not available for purchase. Status: {}", itemId, item.getStatus());
      throw new IllegalStateException("Item is not available for purchase.");
    }

    double amount = item.getPrice();
    String orderId = "order-" + itemId + "-" + user.getId() + "-" + System.currentTimeMillis();

    String callbackPrefix = "https://mentally-crucial-quagga.ngrok-free.app/api/payments/vipps-callback";
    String fallBackUrl = "https://mentally-crucial-quagga.ngrok-free.app/api/payments/vipps-complete?orderId=" + orderId;

    return initiatePayment(orderId, amount, user.getPhoneNumber(), callbackPrefix, fallBackUrl);
  }

  /**
   * Checks if the order has been finalized.
   *
   * @param orderId the ID of the order
   * @return true if the order has been finalized, false otherwise
   */
  public boolean hasOrderBeenFinalized(String orderId) {
    logger.debug("Checking if order {} has been finalized", orderId);

    int retries = 8;
    int delayMs = 1000;

    for (int i = 0; i < retries; i++) {
      Boolean status = paymentStatusMap.get(orderId);
      if (status != null && status) {
        logger.debug("Order {} was finalized", orderId);
        return true;
      }

      try {
        Thread.sleep(delayMs);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        logger.warn("Thread interrupted while waiting for order {} finalization", orderId);
        break;
      }
    }

    logger.debug("Order {} was not finalized in time", orderId);
    return false;
  }
}
