package com.foodordering.controller;

import com.foodordering.model.Customer;
import com.foodordering.repository.CustomerRepository;
import com.foodordering.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*") // Allows frontend to access
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerRepository customerRepository; // Added for login/register logic

    // GET: http://localhost:8080/api/customers
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    // GET: http://localhost:8080/api/customers/high-value
    // ASSIGNMENT REQUIREMENT: Find customers > average order value
    @GetMapping("/high-value")
    public ResponseEntity<List<Customer>> getHighValueCustomers() {
        return ResponseEntity.ok(customerService.getHighValueCustomers());
    }

    // POST: http://localhost:8080/api/customers/register
    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@RequestBody Customer customer) {
        // 1. Check if email already exists
        if (customerRepository.findByEmail(customer.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already in use");
        }

        // 2. Save new customer
        customer.setRole("USER");
        Customer savedCustomer = customerRepository.save(customer);
        return ResponseEntity.ok(savedCustomer);
    }

    // POST: http://localhost:8080/api/customers/login
    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(@RequestBody LoginRequest request) {
        Optional<Customer> customerOpt = customerRepository.findByEmail(request.email());

        // Check if user exists and password matches
        if (customerOpt.isPresent() && customerOpt.get().getPassword().equals(request.password())) {
            return ResponseEntity.ok(customerOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    // Simple DTO to capture the login JSON
    public record LoginRequest(String email, String password) {}
}