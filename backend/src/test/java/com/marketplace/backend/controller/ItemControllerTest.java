package com.marketplace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.backend.BackendApplication;
import com.marketplace.backend.controller.config.MockCloudinaryConfig;
import com.marketplace.backend.dto.ItemCreateDto;
import com.marketplace.backend.model.*;
import com.marketplace.backend.repository.CategoryRepository;
import com.marketplace.backend.repository.ItemRepository;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.service.CloudinaryService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the ItemController.
 */
@SpringBootTest(classes = {
    BackendApplication.class,
    MockCloudinaryConfig.class
})
@Transactional
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Import(MockCloudinaryConfig.class)
class ItemControllerTest {

  @Autowired
  private EntityManager entityManager;

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private ItemRepository itemRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private CategoryRepository categoryRepository;

  @Autowired
  private CloudinaryService cloudinaryService;

  private User testUser;

  private Category testCategory;

  /**
   * Set up test data.
   */
  @BeforeEach
  void setUp() {
    userRepository.findAll().forEach(user -> {
      user.getFavoriteItems().clear();
      userRepository.save(user);
    });

    itemRepository.deleteAll();
    userRepository.deleteAll();
    categoryRepository.deleteAll();

    testUser = new User("John Doe", "john@example.com", "password123", Role.USER,
        "1234567890", null, "english");
    testUser = userRepository.save(testUser);

    testCategory = categoryRepository.save(new Category(null, "Electronics"));

    Item item1 = new Item(testUser, "Phone", "Smartphone", testCategory, 300.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    item1.setStatus(ItemStatus.FOR_SALE);

    Item item2 = new Item(testUser, "Tablet", "Android tablet", testCategory, 200.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    item2.setStatus(ItemStatus.FOR_SALE);

    itemRepository.saveAll(List.of(item1, item2));
  }

  /**
   * Test to get an item by its ID.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldReturnItemById() throws Exception {
    Item item = new Item(testUser, "Camera", "DSLR", testCategory, 500.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    item.setStatus(ItemStatus.FOR_SALE);
    item = itemRepository.save(item);

    mockMvc.perform(get("/api/items/" + item.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Camera"));
  }

  /**
   * Test to get items for the current user.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldReturnItemsForCurrentUser() throws Exception {
    mockMvc.perform(get("/api/items/my-items"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].title").value("Phone"))
        .andExpect(jsonPath("$[1].title").value("Tablet"));
  }

  /**
   * Test to delete an item.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldReturnFavoriteItemsForCurrentUser() throws Exception {
    Item favoriteItem = new Item(testUser, "Favorited Laptop", "Gaming laptop", testCategory, 1200.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    favoriteItem.setStatus(ItemStatus.FOR_SALE);
    favoriteItem = itemRepository.save(favoriteItem);

    testUser.getFavoriteItems().add(favoriteItem);
    userRepository.save(testUser);

    entityManager.flush();
    entityManager.clear();

    mockMvc.perform(get("/api/items/favorites"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].title").value("Favorited Laptop"))
        .andExpect(jsonPath("$[0].favoritedByCurrentUser").value(true));
  }

  /**
   * Test to toggle favorite status for an item.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldToggleFavoriteItem() throws Exception {
    Item item = new Item(testUser, "Toggle Test", "Will be toggled", testCategory, 999.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    item.setStatus(ItemStatus.FOR_SALE);
    item = itemRepository.save(item);

    mockMvc.perform(put("/api/items/" + item.getId() + "/favorite-toggle"))
        .andExpect(status().isOk());

    User refreshedUser = userRepository.findById(testUser.getId()).orElseThrow();
    assert refreshedUser.getFavoriteItems().contains(item);

    mockMvc.perform(put("/api/items/" + item.getId() + "/favorite-toggle"))
        .andExpect(status().isOk());

    refreshedUser = userRepository.findById(testUser.getId()).orElseThrow();
    assert !refreshedUser.getFavoriteItems().contains(item);
  }

  /**
   * Test to create an item.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldCreateItem() throws Exception {
    ItemCreateDto newItem = new ItemCreateDto();
    newItem.setTitle("Headphones");
    newItem.setDescription("Noise-cancelling");
    newItem.setCategoryId(testCategory.getId());
    newItem.setPrice(150.0);
    newItem.setLatitude(new BigDecimal("63.4300"));
    newItem.setLongitude(new BigDecimal("10.3925"));

    MockMultipartFile jsonPart = new MockMultipartFile(
        "item",
        "",
        "application/json",
        objectMapper.writeValueAsBytes(newItem)
    );

    MockMultipartFile imageFile = new MockMultipartFile(
        "images",
        "image.jpg",
        "image/jpeg",
        "dummy-image-content".getBytes()
    );

    mockMvc.perform(MockMvcRequestBuilders.multipart("/api/items/create")
            .file(jsonPart)
            .file(imageFile)
            .contentType(MediaType.MULTIPART_FORM_DATA)
            .characterEncoding("UTF-8"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.title").value("Headphones"))
        .andExpect(jsonPath("$.categoryId").value(testCategory.getId()))
        .andExpect(jsonPath("$.imageUrls").isArray());
  }

  /**
   * Test to update an item.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldUpdateItem() throws Exception {
    Item item = new Item(testUser, "Old Title", "Old Desc", testCategory, 100.0,
        LocalDateTime.now(), new BigDecimal("63.0"), new BigDecimal("10.0"));
    item.setStatus(ItemStatus.FOR_SALE);
    item = itemRepository.save(item);

    MockMultipartFile updateFile = new MockMultipartFile("dto", "", MediaType.APPLICATION_JSON_VALUE,
        ("{" +
            "\"title\":\"Updated Title\"," +
            "\"description\":\"Updated Description\"," +
            "\"categoryId\":" + testCategory.getId() + "," +
            "\"price\":120.0," +
            "\"latitude\":64.0000," +
            "\"longitude\":11.0000" +
            "}").getBytes());

    mockMvc.perform(multipart("/api/items/" + item.getId())
            .file(updateFile)
            .with(request -> {
              request.setMethod("PUT");
              return request;
            })
            .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Updated Title"))
        .andExpect(jsonPath("$.description").value("Updated Description"))
        .andExpect(jsonPath("$.price").value(120.0))
        .andExpect(jsonPath("$.latitude").value(64.0000))
        .andExpect(jsonPath("$.longitude").value(11.0000));
  }

  /**
   * Test to delete an item.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldDeleteItem() throws Exception {
    Item item = new Item(testUser, "Delete Me", "To be deleted", testCategory, 999.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    item.setStatus(ItemStatus.FOR_SALE);
    item = itemRepository.save(item);

    mockMvc.perform(delete("/api/items/" + item.getId()))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/api/items/" + item.getId()))
        .andExpect(status().isNotFound());
  }

  @Test
  @WithMockUser(username = "john@example.com")
  void shouldReturnNotFoundWhenDeletingNonExistentItem() throws Exception {
    long nonExistentId = 999999L;

    mockMvc.perform(delete("/api/items/" + nonExistentId))
        .andExpect(status().isNotFound());
  }


  /**
   * Test to delete old image when updating an item.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldDeleteOldImageWhenUpdatingItem() throws Exception {
    Item item = new Item(testUser, "Old Title", "Old Desc", testCategory, 100.0,
        LocalDateTime.now(), new BigDecimal("63.0"), new BigDecimal("10.0"));
    item.setStatus(ItemStatus.FOR_SALE);

    String oldImageUrl = "https://res.cloudinary.com/drpa3n1yc/image/upload/v1234567890/abc123.jpg";
    Image oldImage = new Image(item, oldImageUrl);
    item.addImage(oldImage);
    item = itemRepository.save(item);

    MockMultipartFile updateFile = new MockMultipartFile("dto", "", MediaType.APPLICATION_JSON_VALUE,
        ("{" +
            "\"title\":\"New Title\"," +
            "\"description\":\"New Description\"," +
            "\"categoryId\":" + testCategory.getId() + "," +
            "\"price\":150.0," +
            "\"latitude\":64.0000," +
            "\"longitude\":11.0000," +
            "\"status\":\"FOR_SALE\"" +
            "}").getBytes());

    MockMultipartFile imageFile = new MockMultipartFile(
        "images",
        "new-image.jpg",
        "image/jpeg",
        "dummy-new-image".getBytes()
    );

    mockMvc.perform(multipart("/api/items/" + item.getId())
            .file(updateFile)
            .file(imageFile)
            .with(req -> { req.setMethod("PUT"); return req; })
            .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isOk());

    verify(cloudinaryService).deleteImage("abc123");
  }

  /**
   * Test to update the status of an item.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldUpdateItemStatus() throws Exception {
    User seller = testUser;

    User buyer = new User("Buyer Bob", "bob@example.com", "password", Role.USER, "98765432", null, "english");
    buyer = userRepository.save(buyer);

    Category category = categoryRepository.save(new Category("Test"));

    Item item = new Item(seller, "Status Test", "Initial status", category, 100.0,
        LocalDateTime.now(), new BigDecimal("63.0"), new BigDecimal("10.0"));
    item.setStatus(ItemStatus.FOR_SALE);
    item = itemRepository.save(item);

    mockMvc.perform(put("/api/items/" + item.getId() + "/status")
            .param("value", "RESERVED")
            .param("buyerId", String.valueOf(buyer.getId())))
        .andExpect(status().isOk());

    entityManager.flush();
    entityManager.clear();

    Item updated = itemRepository.findById(item.getId()).orElseThrow();
    assert updated.getStatus() == ItemStatus.RESERVED;
    assert updated.getReservedBy().getId().equals(buyer.getId());
  }

  /**
   * Test to reserve an item by a buyer.
   *
   * @throws Exception if the test fails
   */
  @Test
  @WithMockUser(username = "john@example.com")
  void shouldReserveItemForBuyer() throws Exception {
    User buyer = new User("Buyer Bob", "bob@example.com", "password", Role.USER, "987654321", null, "english");
    buyer = userRepository.save(buyer);

    Item item = new Item(testUser, "Reserving Test", "Should be reserved", testCategory, 250.0,
        LocalDateTime.now(), new BigDecimal("63.4300"), new BigDecimal("10.3925"));
    item.setStatus(ItemStatus.FOR_SALE);
    item = itemRepository.save(item);

    item.setReservedBy(buyer);
    item.setStatus(ItemStatus.RESERVED);
    itemRepository.save(item);

    entityManager.flush();
    entityManager.clear();

    mockMvc.perform(get("/api/items/" + item.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("RESERVED"))
        .andExpect(jsonPath("$.reservedById").value(buyer.getId().intValue()));
  }
}
