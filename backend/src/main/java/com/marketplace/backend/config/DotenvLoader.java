package com.marketplace.backend.config;

import io.github.cdimascio.dotenv.Dotenv;

/**
 * A class to load environment variables from a .env file.
 */
public class DotenvLoader {

  /**
   * Loads environment variables from a .env file and sets them as system properties.
   */
  public static void load() {
    Dotenv dotenv = Dotenv.configure()
        .ignoreIfMalformed()
        .ignoreIfMissing()
        .load();

    dotenv.entries().forEach(entry -> {
      if (System.getenv(entry.getKey()) == null && System.getProperty(entry.getKey()) == null) {
        System.setProperty(entry.getKey(), entry.getValue());
      }
    });
  }
}
