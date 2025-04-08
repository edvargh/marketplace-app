package com.marketplace.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.marketplace.backend.model.Role;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Test class for the CustomUserDetailsService.
 */
@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private CustomUserDetailsService service;

  /**
   * Test for loadUserByUsername method.
   */
  @Test
  void shouldReturnUserDetailsWhenUserExists() {
    User user = new User("John Doe", "john@example.com", "password", Role.USER, null, null, null);
    when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

    UserDetails result = service.loadUserByUsername("john@example.com");

    assertEquals("john@example.com", result.getUsername());
    assertEquals("password", result.getPassword());
  }

  /**
   * Test for loadUserByUsername method when user is not found.
   */
  @Test
  void shouldThrowExceptionWhenUserNotFound() {
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThrows(UsernameNotFoundException.class,
        () -> service.loadUserByUsername("ghost@example.com"));
  }
}
