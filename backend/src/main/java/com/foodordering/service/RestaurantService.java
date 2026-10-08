package com.foodordering.service;

import com.foodordering.model.MenuItem;
import com.foodordering.model.Restaurant;
import com.foodordering.repository.MenuItemRepository;
import com.foodordering.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + id));
    }

    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    // NEW METHOD: Handing the menu logic here instead of directly in the controller
    public List<MenuItem> getMenuByRestaurantId(Long restaurantId) {
        // 1. First, verify the restaurant actually exists (throws exception if not)
        getRestaurantById(restaurantId);

        // 2. Return the menu items for that restaurant
        return menuItemRepository.findByRestaurantId(restaurantId);
    }
}