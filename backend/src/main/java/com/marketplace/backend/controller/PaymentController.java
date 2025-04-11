package com.marketplace.backend.controller;

import com.marketplace.backend.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

/**
 * Controller for handling payment-related requests.
 */
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

  private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

  private final PaymentService paymentService;

  /**
   * Constructor for PaymentController.
   *
   * @param paymentService the service for handling payment-related operations
   */
  public PaymentController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  /**
   * Initiates a payment for an order.
   *
   * @param itemId the ID of the item to be paid for
   * @param userDetails the authenticated user's details
   * @return a response entity containing the redirect URL for payment
   */
  @PostMapping("/vipps")
  public ResponseEntity<String> buyNowWithVipps(@RequestParam Long itemId,
                                                @AuthenticationPrincipal UserDetails userDetails) {
    logger.info("Initiating Vipps payment for item {} by user {}", itemId, userDetails.getUsername());

    try {
      String redirectUrl = paymentService.createVippsPayment(itemId, userDetails.getUsername());
      logger.debug("Vipps payment created successfully. Redirect URL: {}", redirectUrl);
      return ResponseEntity.ok(redirectUrl);
    } catch (IllegalStateException e) {
      logger.warn("Payment conflict for item {}: {}", itemId, e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    } catch (Exception e) {
      logger.error("Failed to initiate Vipps payment for item {}: {}", itemId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to initiate Vipps payment: " + e.getMessage());
    }
  }

  /**
   * Handles the callback from Vipps after payment.
   *
   * @param payload the payload received from Vipps
   * @param orderId the ID of the order
   * @return a response entity indicating the result of the operation
   */
  @PostMapping("/vipps-callback/v2/payments/{orderId}")
  public ResponseEntity<Void> handleVippsCallback(@RequestBody Map<String, Object> payload,
                                                  @PathVariable String orderId) {
    logger.info("Vipps CALLBACK received for order: {}", orderId);

    try {
      paymentService.finalizeOrderFromVippsCallback(orderId, payload);
      logger.info("Order {} finalized from Vipps callback", orderId);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      logger.error("Failed to finalize order {} from Vipps callback: {}", orderId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Handles the completion of the payment process.
   *
   * @return a response entity redirecting to the payment completion page
   */
  @GetMapping("/vipps-complete")
  public ResponseEntity<Void> vippsComplete(@RequestParam String orderId) {
    logger.info("Checking payment completion for order: {}", orderId);

    try {
      boolean isFinalized = paymentService.hasOrderBeenFinalized(orderId);
      URI redirectUri = isFinalized
          ? URI.create("http://localhost:5173/payment-complete?orderId=" + orderId)
          : URI.create("http://localhost:5173/payment-failed");

      logger.info("Redirecting to: {}", redirectUri);
      return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
    } catch (Exception e) {
      logger.error("Error during payment completion check for order {}: {}", orderId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.FOUND)
          .location(URI.create("http://localhost:5173/payment-failed")).build();
    }
  }
}
