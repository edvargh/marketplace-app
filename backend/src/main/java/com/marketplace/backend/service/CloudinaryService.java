package com.marketplace.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Service for handling Cloudinary related operations.
 */
@Service
@Primary
public class CloudinaryService {

  private final Cloudinary cloudinary;

  public CloudinaryService(Cloudinary cloudinary) {
    this.cloudinary = cloudinary;
  }

  /**
   * Upload a file to Cloudinary and return the secure URL.
   *
   * @param file the file to upload
   * @return the secure URL of the uploaded file
   * @throws IOException if an error occurs during upload
   */
  public String uploadImage(MultipartFile file) throws IOException {
    Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
    return result.get("secure_url").toString();
  }

  /**
   * Delete a file from Cloudinary by its public ID.
   *
   * @param publicId the public ID of the file to delete
   * @return the result map from Cloudinary
   * @throws IOException if an error occurs during deletion
   */
  public Map<String, Object> deleteImage(String publicId) throws IOException {
    return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
  }
}
