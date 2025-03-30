package com.marketplace.backend.service;

import com.marketplace.backend.model.ItemStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.marketplace.backend.dto.ItemCreateDto;
import com.marketplace.backend.dto.ItemResponseDto;
import com.marketplace.backend.dto.ItemUpdateDto;
import com.marketplace.backend.model.Category;
import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.CategoryRepository;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for handling item related requests.
 */
@Service
public class ItemService {

  private final ItemRepository itemRepository;
  private final UserRepository userRepository;
  private final CategoryRepository categoryRepository;

  public ItemService(ItemRepository itemRepository,
                     UserRepository userRepository,
                     CategoryRepository categoryRepository) {
    this.itemRepository = itemRepository;
    this.userRepository = userRepository;
    this.categoryRepository = categoryRepository;
  }

  public List<ItemResponseDto> getAllItems() {
    return itemRepository.findAll().stream()
        .map(ItemResponseDto::fromEntity)
        .collect(Collectors.toList());
  }

  public Optional<ItemResponseDto> getItemById(Long id) {
    return itemRepository.findById(id)
        .map(ItemResponseDto::fromEntity);
  }

  public ItemResponseDto createItem(ItemCreateDto dto) {
    String email = getAuthenticatedEmail();
    User seller = userRepository.findByEmail(email).orElseThrow();
    Category category = categoryRepository.findById(dto.getCategoryId()).orElseThrow();

    Item item = new Item();
    item.setSeller(seller);
    item.setCategory(category);
    item.setTitle(dto.getTitle());
    item.setDescription(dto.getDescription());
    item.setPrice(dto.getPrice());
    item.setLatitude(dto.getLatitude());
    item.setLongitude(dto.getLongitude());
    item.setPublishedDate(LocalDateTime.now());
    item.setStatus(ItemStatus.FOR_SALE); // ✅ Add this line

    itemRepository.save(item);
    return ItemResponseDto.fromEntity(item);
  }


  public Optional<ItemResponseDto> updateItem(Long id, ItemUpdateDto dto) {
    return itemRepository.findById(id).map(item -> {
      if (dto.getTitle() != null) item.setTitle(dto.getTitle());
      if (dto.getDescription() != null) item.setDescription(dto.getDescription());
      if (dto.getPrice() != null) item.setPrice(dto.getPrice());
      if (dto.getLatitude() != null) item.setLatitude(dto.getLatitude());
      if (dto.getLongitude() != null) item.setLongitude(dto.getLongitude());
      if (dto.getStatus() != null) item.setStatus(dto.getStatus());

      if (dto.getCategoryId() != null) {
        Category category = categoryRepository.findById(dto.getCategoryId()).orElseThrow();
        item.setCategory(category);
      }

      Item updated = itemRepository.save(item);
      return ItemResponseDto.fromEntity(updated);
    });
  }

  private String getAuthenticatedEmail() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication.getName(); // Spring extracts username from token
  }
}
