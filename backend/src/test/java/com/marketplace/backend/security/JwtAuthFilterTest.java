package com.marketplace.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.io.IOException;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Test class for the JwtAuthFilter.
 */
class JwtAuthFilterTest {

  private JwtService jwtService;
  private JwtAuthFilter jwtAuthFilter;
  private FilterChain filterChain;
  private CustomUserDetailsService userDetailsService;

  @BeforeEach
  void setUp() {
    jwtService = mock(JwtService.class);
    userDetailsService = mock(CustomUserDetailsService.class);
    filterChain = mock(FilterChain.class);
    jwtAuthFilter = new JwtAuthFilter(jwtService, userDetailsService);
    SecurityContextHolder.clearContext();
  }

  /**
   * Test for the doFilterInternal method when no Authorization header is present.
   */
  @Test
  void shouldContinueFilterChainWhenNoAuthHeaderPresent() throws ServletException, IOException {
    var request = new MockHttpServletRequest();
    var response = new MockHttpServletResponse();

    jwtAuthFilter.doFilterInternal(request, response, filterChain);

    verify(filterChain, times(1)).doFilter(request, response);
    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  /**
   * Test for the doFilterInternal method when the Authorization header is invalid.
   */
  @Test
  void shouldContinueFilterChainWhenAuthHeaderIsInvalid() throws ServletException, IOException {
    var request = new MockHttpServletRequest();
    request.addHeader("Authorization", "InvalidHeader");
    var response = new MockHttpServletResponse();

    jwtAuthFilter.doFilterInternal(request, response, filterChain);

    verify(filterChain, times(1)).doFilter(request, response);
    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  /**
   * Test for setting authentication when the JWT is valid.
   */
  @Test
  void shouldSetAuthenticationWhenJwtIsValid() throws ServletException, IOException {
    var username = "user@example.com";
    var jwt = "valid.jwt.token";

    var request = new MockHttpServletRequest();
    request.addHeader("Authorization", "Bearer " + jwt);
    var response = new MockHttpServletResponse();

    UserDetails userDetails = new User(username, "password", Collections.emptyList());

    when(jwtService.extractUsername(jwt)).thenReturn(username);
    when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
    when(jwtService.isTokenValid(jwt, username)).thenReturn(true);

    jwtAuthFilter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
    assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    assertEquals(username, SecurityContextHolder.getContext().getAuthentication().getName());
  }

  /**
   * Test for not setting authentication when already authenticated.
   */
  @Test
  void shouldNotSetAuthenticationWhenAlreadyAuthenticated() throws ServletException, IOException {
    var request = new MockHttpServletRequest();
    request.addHeader("Authorization", "Bearer sometoken");
    var response = new MockHttpServletResponse();

    var existingAuth = new UsernamePasswordAuthenticationToken("existing", null, Collections.emptyList());
    SecurityContextHolder.getContext().setAuthentication(existingAuth);

    jwtAuthFilter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
    assertEquals("existing", SecurityContextHolder.getContext().getAuthentication().getPrincipal());
  }
}
