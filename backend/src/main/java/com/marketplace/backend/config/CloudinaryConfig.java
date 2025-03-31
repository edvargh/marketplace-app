package com.marketplace.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.marketplace.backend.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Cloudinary.
 */
@Configuration
public class CloudinaryConfig {

  @Value("${cloudinary.cloud_name}")
  private String cloudName;

  @Value("${cloudinary.api_key}")
  private String apiKey;

  @Value("${cloudinary.api_secret}")
  private String apiSecret;

  /**
   * Bean for Cloudinary.
   *
   * @return a Cloudinary instance
   */
  @Bean
  public Cloudinary cloudinary() {
    return new Cloudinary(ObjectUtils.asMap(
        "cloud_name", cloudName,
        "api_key", apiKey,
        "api_secret", apiSecret
    ));
  }

  /**
   * Bean for CloudinaryService.
   *
   * @param cloudinary the Cloudinary instance
   * @return a CloudinaryService instance
   */
  @Bean
  public CloudinaryService cloudinaryService(Cloudinary cloudinary) {
    return new CloudinaryService(cloudinary);
  }
}
