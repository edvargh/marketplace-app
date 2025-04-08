package com.marketplace.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DotenvLoaderTest {

  @Test
  void shouldSetSystemPropertiesFromDotenv() {
    Dotenv dotenv = Dotenv.configure()
        .ignoreIfMalformed()
        .ignoreIfMissing()
        .load();

    DotenvLoader.load();

    for (var entry : dotenv.entries()) {
      String key = entry.getKey();
      String expected = entry.getValue();

      String actual = System.getProperty(key);
      if (System.getenv(key) == null) {
        assertEquals(expected, actual, "System property should be set for: " + key);
      }
    }
  }
}
