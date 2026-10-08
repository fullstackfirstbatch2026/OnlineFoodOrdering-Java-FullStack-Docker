package com.foodordering.repository;

import com.foodordering.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    // ASSIGNMENT REQUIREMENT: Find customers whose total order value is greater
    // than the average order value using a subquery.
    @Query(value = "SELECT c.* FROM customers c JOIN orders o ON c.id = o.customer_id " +
            "GROUP BY c.id HAVING SUM(o.total_amount) > " +
            "(SELECT AVG(total_amount) FROM orders)", nativeQuery = true)
    List<Customer> findCustomersExceedingAverageOrderValue();
}