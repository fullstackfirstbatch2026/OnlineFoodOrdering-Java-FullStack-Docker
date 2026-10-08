package com.foodordering.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "ORDERS")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    @JsonIgnoreProperties({"orders", "password"})
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "restaurant_id")
    @JsonIgnoreProperties({"menuItems", "orders"})
    private Restaurant restaurant;

    @Column(name = "total_amount")
    private BigDecimal totalAmount = BigDecimal.ZERO;

    private String status = "PENDING";

    @Column(name = "order_date", insertable = false, updatable = false)
    private LocalDateTime orderDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("order")
    private List<OrderItem> orderItems;
}