package com.marketplace.backend.controller;

import com.marketplace.backend.service.PaymentService;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for handling payment-related requests.
 */
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

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
    String callbackPrefix = "https://mentally-crucial-quagga.ngrok-free.app/api/payments/vipps-callback";
    String fallBackUrl = "https://mentally-crucial-quagga.ngrok-free.app/api/payments/vipps-complete";

    try {
      String redirectUrl = paymentService.createVippsPayment(itemId, userDetails.getUsername(), callbackPrefix, fallBackUrl);
      return ResponseEntity.ok(redirectUrl);
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    } catch (Exception e) {
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

    try {
      paymentService.finalizeOrderFromVippsCallback(orderId);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Handles the completion of the payment process.
   *
   * @return a response entity redirecting to the payment completion page
   */
  @GetMapping("/vipps-complete")
  public ResponseEntity<Void> vippsComplete() {
    URI redirectUri = URI.create("http://localhost:5173/payment-complete");
    return ResponseEntity.status(HttpStatus.FOUND)
        .location(redirectUri)
        .build();
  }
}
