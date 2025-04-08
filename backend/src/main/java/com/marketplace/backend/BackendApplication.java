package com.marketplace.backend;

import com.marketplace.backend.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
public class BackendApplication {

  public static void main(String[] args) {
    DotenvLoader.load();
    SpringApplication.run(BackendApplication.class, args);
  }

}
