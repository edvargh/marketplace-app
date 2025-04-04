package com.marketplace.backend.controller;

import com.marketplace.backend.model.Item;
import com.marketplace.backend.model.User;
import com.marketplace.backend.service.ItemService;
import com.marketplace.backend.service.ItemViewService;
import com.marketplace.backend.service.UserService;
import com.marketplace.backend.dto.ItemResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller for handling item view-related requests.
 */
@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:5173")
public class ItemViewController {

  private final ItemViewService itemViewService;
  private final UserService userService;
  private final ItemService itemService;

  public ItemViewController(ItemViewService itemViewService, UserService userService, ItemService itemService) {
    this.itemViewService = itemViewService;
    this.userService = userService;
    this.itemService = itemService;
  }

  /**
   * Logs a view for the given item by the current user.
   */
  @PostMapping("/{itemId}")
  public ResponseEntity<Void> logItemView(@PathVariable Long itemId, @AuthenticationPrincipal UserDetails userDetails) {
    Optional<Item> itemOpt = itemService.findById(itemId);
    if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

    User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
    itemViewService.logItemView(user, itemOpt.get());
    return ResponseEntity.ok().build();
  }

  /**
   * Get recommended items for the current user.
   */
  @GetMapping("/recommended")
  public ResponseEntity<List<ItemResponseDto>> getRecommendedItems(@AuthenticationPrincipal UserDetails userDetails) {
    User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
    List<Item> recommended = itemViewService.getRecommendedItems(user);
    List<ItemResponseDto> response = recommended.stream()
        .map(ItemResponseDto::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(response);
  }
}
