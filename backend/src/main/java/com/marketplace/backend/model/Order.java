package com.marketplace.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Orders")
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  private User buyer;

  @ManyToOne
  private User seller;

  @OneToOne
  private Item item;

  @Column(name = "order_date")
  private LocalDateTime orderDate;

  @Column(nullable = false)
  private double price;


  // Getters & setters
  public Long getId() { return id; }

  public User getBuyer() { return buyer; }
  public void setBuyer(User buyer) { this.buyer = buyer; }

  public User getSeller() { return seller; }
  public void setSeller(User seller) { this.seller = seller; }

  public Item getItem() { return item; }
  public void setItem(Item item) { this.item = item; }

  public LocalDateTime getOrderDate() { return orderDate; }
  public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
  public double getPrice() { return price; }
  public void setPrice(double price) { this.price = price; }
}
