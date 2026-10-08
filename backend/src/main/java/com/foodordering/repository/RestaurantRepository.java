package com.foodordering.repository;

import com.foodordering.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    // JpaRepository provides findAll(), findById(), save(), deleteById() out of the box.
}