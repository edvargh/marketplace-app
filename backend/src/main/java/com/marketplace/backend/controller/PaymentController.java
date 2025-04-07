package com.marketplace.backend.controller;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.ItemStatus;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

  private final PaymentService paymentService;
  private final UserRepository userRepository;
  private final ItemRepository itemRepository;

  public PaymentController(PaymentService paymentService, UserRepository userRepository, ItemRepository itemRepository) {
    this.paymentService = paymentService;
    this.userRepository = userRepository;
    this.itemRepository = itemRepository;
  }

  @PostMapping("/vipps")
  public ResponseEntity<String> buyNowWithVipps(@RequestParam Long itemId,
                                                @AuthenticationPrincipal UserDetails userDetails) {
    User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    Item item = itemRepository.findById(itemId).orElse(null);
    if (item == null) return ResponseEntity.notFound().build();

    if (item.getStatus() == ItemStatus.SOLD || item.getStatus() == ItemStatus.RESERVED) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body("Item is not available for purchase.");
    }

    double amount = item.getPrice();
    String orderId = "order-" + itemId + "-" + user.getId() + "-" + System.currentTimeMillis();

    String callbackPrefix = "https://mentally-crucial-quagga.ngrok-free.app/api/payments/vipps-callback";
    String fallBackUrl = "https://mentally-crucial-quagga.ngrok-free.app/api/payments/vipps-complete";

    try {
      String redirectUrl = paymentService.initiatePayment(orderId, amount, user.getPhoneNumber(), callbackPrefix, fallBackUrl);
      return ResponseEntity.ok(redirectUrl);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to initiate Vipps payment: " + e.getMessage());
    }
  }

  @PostMapping("/vipps-callback/v2/payments/{orderId}")
  public ResponseEntity<Void> handleVippsCallback(@RequestBody Map<String, Object> payload) {
    System.out.println("Received Vipps callback with payload: " + payload);
    String orderId = (String) payload.get("orderId");

    if (orderId == null || !orderId.startsWith("order-")) {
      return ResponseEntity.badRequest().build();
    }

    try {
      String[] parts = orderId.split("-");
      Long itemId = Long.parseLong(parts[1]);

      Optional<Item> itemOpt = itemRepository.findById(itemId);
      if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

      Item item = itemOpt.get();

      if (item.getStatus() != ItemStatus.SOLD) {
        item.setStatus(ItemStatus.SOLD);
        itemRepository.save(item);
      }

      return ResponseEntity.ok().build();
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @GetMapping("/vipps-complete")
  public ResponseEntity<String> vippsComplete() {
    return ResponseEntity.ok("Payment completed! You can now return to the app.");
  }
}
