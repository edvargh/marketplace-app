package com.marketplace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.backend.service.PaymentService;
import jakarta.transaction.Transactional;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the PaymentController.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
public class PaymentControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockBean
  private PaymentService paymentService;

  /**
   * Test for the buy now endpoint with Vipps payment.
   */
  @Test
  @WithMockUser(username = "testuser")
  void shouldBuyNowWithVippsSuccessfully() throws Exception {
    Long itemId = 1L;
    String expectedRedirectUrl = "https://vipps.no/redirect";

    when(paymentService.createVippsPayment(eq(itemId), eq("testuser"),
        anyString(), anyString())).thenReturn(expectedRedirectUrl);

    mockMvc.perform(post("/api/payments/vipps")
            .param("itemId", itemId.toString()))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString(expectedRedirectUrl)));

    verify(paymentService, times(1)).createVippsPayment(eq(itemId), eq("testuser"),
        anyString(), anyString());
  }

  /**
   * Test for the buy now endpoint with Vipps payment when item is already sold.
   */
  @Test
  @WithMockUser(username = "testuser")
  void shouldReturnConflictWhenItemAlreadySold() throws Exception {
    Long itemId = 1L;
    String errorMessage = "Item is already sold";

    when(paymentService.createVippsPayment(eq(itemId), eq("testuser"),
        anyString(), anyString())).thenThrow(new IllegalStateException(errorMessage));

    mockMvc.perform(post("/api/payments/vipps")
            .param("itemId", itemId.toString()))
        .andExpect(status().isConflict())
        .andExpect(content().string(containsString(errorMessage)));

    verify(paymentService, times(1)).createVippsPayment(eq(itemId), eq("testuser"),
        anyString(), anyString());
  }

  /**
   * Test for the buy now endpoint with Vipps payment when item is not found.
   */
  @Test
  @WithMockUser(username = "testuser")
  void shouldReturnInternalServerErrorOnVippsPaymentFailure() throws Exception {
    Long itemId = 1L;

    when(paymentService.createVippsPayment(eq(itemId), eq("testuser"),
        anyString(), anyString())).thenThrow(new RuntimeException("Database is down"));

    mockMvc.perform(post("/api/payments/vipps")
            .param("itemId", itemId.toString()))
        .andExpect(status().isInternalServerError())
        .andExpect(content().string(containsString("Failed to initiate Vipps payment")));

    verify(paymentService, times(1)).createVippsPayment(eq(itemId), eq("testuser"),
        anyString(), anyString());
  }

  /**
   * Test for handling vipps callback successfully.
   */
  @Test
  void shouldHandleVippsCallbackSuccessfully() throws Exception {
    String orderId = "test-order-id";
    String url = "/api/payments/vipps-callback/v2/payments/" + orderId;

    String payloadJson = objectMapper.writeValueAsString(Map.of());

    doNothing().when(paymentService).finalizeOrderFromVippsCallback(orderId);

    mockMvc.perform(post(url)
            .contentType("application/json")
            .content(payloadJson))
        .andExpect(status().isOk());

    verify(paymentService, times(1)).finalizeOrderFromVippsCallback(orderId);
  }

  /**
   * Test for handling vipps callback with an error.
   */
  @Test
  void shouldReturnInternalServerErrorOnVippsCallbackFailure() throws Exception {
    String orderId = "error-order";
    String url = "/api/payments/vipps-callback/v2/payments/" + orderId;
    String payloadJson = objectMapper.writeValueAsString(Map.of());

    doThrow(new RuntimeException("Something went wrong"))
        .when(paymentService).finalizeOrderFromVippsCallback(orderId);

    mockMvc.perform(post(url)
            .contentType("application/json")
            .content(payloadJson))
        .andExpect(status().isInternalServerError());

    verify(paymentService, times(1)).finalizeOrderFromVippsCallback(orderId);
  }

  /**
   * Test for handling vipps complete redirect.
   */
  @Test
  void shouldRedirectToFrontendOnVippsComplete() throws Exception {
    mockMvc.perform(get("/api/payments/vipps-complete"))
        .andExpect(status().isFound())
        .andExpect(header().string("Location", "http://localhost:5173/payment-complete"));
  }
}
