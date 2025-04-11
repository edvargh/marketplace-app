package com.marketplace.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for the JwtService.
 */
class JwtServiceTest {

  private JwtService jwtService;

  private final String testSecret = "test-secret-key";
  private final String testUsername = "john@example.com";

  @BeforeEach
  void setUp() throws Exception {
    jwtService = new JwtService();

    Field secretField = JwtService.class.getDeclaredField("SECRET_KEY");
    secretField.setAccessible(true);
    secretField.set(jwtService, testSecret);
  }

  /**
   * Test to generate a token and extract the correct username from it.
   */
  @Test
  void shouldGenerateTokenAndExtractCorrectUsername() {
    String token = jwtService.generateToken(testUsername);
    String extracted = jwtService.extractUsername(token);

    assertEquals(testUsername, extracted);
  }

  /**
   * Test to check if a valid token is recognized as valid.
   */
  @Test
  void shouldReturnTrueForValidToken() {
    String token = jwtService.generateToken(testUsername);
    boolean valid = jwtService.isTokenValid(token, testUsername);

    assertTrue(valid);
  }

  /**
   * Test to check if a token is invalid when the username does not match.
   */
  @Test
  void shouldReturnFalseForTokenWithWrongUsername() {
    String token = jwtService.generateToken(testUsername);
    boolean valid = jwtService.isTokenValid(token, "wronguser@example.com");

    assertFalse(valid);
  }

  /**
   * Test to ensure extracting from an invalid token throws an exception.
   */
  @Test
  void shouldThrowExceptionForInvalidToken() {
    String invalidToken = "this.is.not.valid";

    assertThrows(Exception.class, () -> jwtService.extractUsername(invalidToken));
  }
}
