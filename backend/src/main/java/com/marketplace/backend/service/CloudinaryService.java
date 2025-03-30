package com.marketplace.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Service for handling Cloudinary related business logic.
 */
@Service
public class CloudinaryService {

  @Autowired
  private Cloudinary cloudinary;

  /**
   * Upload a file to Cloudinary.
   *
   * @param file the file to upload
   * @return a map containing the response from Cloudinary
   * @throws IOException if an error occurs while uploading the file
   */
  public Map uploadFile(MultipartFile file) throws IOException {
    return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
  }

  /**
   * Delete a file from Cloudinary.
   *
   * @param publicId the public ID of the file to delete
   * @return a map containing the response from Cloudinary
   * @throws IOException if an error occurs while deleting the file
   */
  public Map deleteFile(String publicId) throws IOException {
    return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
  }
}