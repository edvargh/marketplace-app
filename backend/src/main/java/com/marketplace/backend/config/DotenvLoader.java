package com.marketplace.backend.config;

import io.github.cdimascio.dotenv.Dotenv;

public class DotenvLoader {

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
