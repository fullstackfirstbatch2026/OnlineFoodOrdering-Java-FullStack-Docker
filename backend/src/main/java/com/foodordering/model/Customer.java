package com.foodordering.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "CUSTOMERS")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String role = "USER";

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    @JsonIgnore // Prevents infinite recursion when sending JSON to the frontend
    private List<Order> orders;
}