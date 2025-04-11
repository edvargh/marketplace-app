package com.marketplace.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
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
  public String uploadImage(Long userId, MultipartFile file) throws IOException {
    String hash = hashFile(file.getBytes());
    String publicId = "items/" + userId + "/" + hash;

    Map<String, Object> uploadOptions = ObjectUtils.asMap(
        "public_id", publicId,
        "unique_filename", false,
        "overwrite", false
    );

    Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
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

  private String hashFile(byte[] data) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-1");
      byte[] hashBytes = digest.digest(data);
      return Base64.getUrlEncoder().withoutPadding().encodeToString(hashBytes);
    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException("Failed to hash file", e);
    }
  }
}
