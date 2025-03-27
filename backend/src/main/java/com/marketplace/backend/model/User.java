package com.marketplace.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String fullName;
  private String email;
  private String password;

  @Enumerated(EnumType.STRING)
  private Role role;
}
