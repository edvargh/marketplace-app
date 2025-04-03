package com.marketplace.backend.controller.config;

import com.marketplace.backend.service.CloudinaryService;
import java.util.Map;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.mockito.Mockito.*;

/**
 * Configuration for mocking CloudinaryService.
 */
@TestConfiguration
public class MockCloudinaryConfig {

  /**
   * Mock CloudinaryService bean.
   *
   * @return a mocked CloudinaryService
   * @throws IOException if an error occurs during mocking
   */
  @Bean
  public CloudinaryService cloudinaryService() throws IOException {
    CloudinaryService mock = mock(CloudinaryService.class);
    when(mock.uploadImage(anyLong(), any(MultipartFile.class)))
        .thenReturn("https://mock.url/fake-image.jpg");
    when(mock.deleteImage(anyString()))
        .thenReturn(Map.of("result", "ok"));

    return mock;
  }
}
