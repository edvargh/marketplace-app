package com.marketplace.backend.security;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.function.Function;

/**
 * Service for handling JWT operations.
 */
@Service
public class JwtService {
  private static final String SECRET_KEY = "supersecretkey"; // move to config for production
  private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours

  /**
   * Extract username from token.
   *
   * @param token the token
   * @return the username
   */
  public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  /**
   * Extract claim from token.
   *
   * @param token the token
   * @param claimsResolver the claims resolver
   * @param <T> the type parameter
   * @return the claim
   */
  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
  }

  /**
   * Generate token for user.
   *
   * @param username the username
   * @return the token
   */
  public String generateToken(String username) {
    return Jwts.builder()
        .setSubject(username)
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
        .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
        .compact();
  }

  /**
   * Validate token.
   *
   * @param token the token
   * @param username the username
   * @return the boolean
   */
  public boolean isTokenValid(String token, String username) {
    final String extractedUsername = extractUsername(token);
    return (extractedUsername.equals(username)) && !isTokenExpired(token);
  }

  /**
   * Validate token expiration.
   *
   * @param token the token
   * @return the boolean
   */
  private boolean isTokenExpired(String token) {
    return extractClaim(token, Claims::getExpiration).before(new Date());
  }

  /**
   * Extract all claims from token.
   *
   * @param token the token
   * @return the claims
   */
  private Claims extractAllClaims(String token) {
    return Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token).getBody();
  }
}
