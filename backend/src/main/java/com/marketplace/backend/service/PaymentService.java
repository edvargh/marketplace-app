package com.marketplace.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

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

  private final RestTemplate restTemplate = new RestTemplate();

  public String initiatePayment(String orderId, double amount, String userPhoneNumber, String callbackPrefix, String fallBackUrl) {
    String accessToken;
    try {
      accessToken = fetchAccessToken();
      System.out.println("Access token: " + accessToken);
    } catch (Exception e) {
      System.err.println("Error fetching access token: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }


    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(accessToken);
    headers.set("Ocp-Apim-Subscription-Key", subscriptionKey);
    headers.set("Merchant-Serial-Number", merchantSerialNumber);
    System.out.println("Headers: " + headers);

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
    System.out.println("Request body: " + body);

    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);



    try {
      ResponseEntity<Map> response = restTemplate.postForEntity(
          vippsBaseUrl + "/ecomm/v2/payments",
          request,
          Map.class
      );

      System.out.println("Response: " + response.getBody() + ", Status code: " + response.getStatusCode() + ", Headers: " + response.getHeaders());

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
}
