package com.foodordering.service;

import com.foodordering.model.Customer;
import com.foodordering.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // ASSIGNMENT REQUIREMENT: Find high-value customers
    public List<Customer> getHighValueCustomers() {
        return customerRepository.findCustomersExceedingAverageOrderValue();
    }
}