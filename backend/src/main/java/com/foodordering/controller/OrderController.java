package com.foodordering.controller;

import com.foodordering.model.Order;
import com.foodordering.model.OrderItem;
import com.foodordering.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // Allows frontend to access
public class OrderController {

    @Autowired
    private OrderService orderService;

    // GET: http://localhost:8080/api/orders
    // ASSIGNMENT REQUIREMENT: Display order details with JOIN
    // RETURN TYPE UPDATED: Now returns a nested Map containing joined items and restaurant names
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrdersWithDetails());
    }

    // POST: http://localhost:8080/api/orders
    // Payload: { "customerId": 1, "restaurantId": 2 }
    // ASSIGNMENT REQUIREMENT: Calls the MySQL Stored Procedure
    @PostMapping
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestBody OrderRequest request) {
        Long newOrderId = orderService.placeNewOrder(request.customerId(), request.restaurantId());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order initialized successfully via procedure.");
        response.put("orderId", newOrderId);
        return ResponseEntity.ok(response);
    }

    // POST: http://localhost:8080/api/orders/1/items
    // Payload: { "menuItemId": 5, "quantity": 2 }
    // ASSIGNMENT REQUIREMENT: Fires the MySQL Trigger to update total & status
    @PostMapping("/{orderId}/items")
    public ResponseEntity<OrderItem> addItemToOrder(
            @PathVariable Long orderId,
            @RequestBody OrderItemRequest request) {

        OrderItem savedItem = orderService.addOrderItem(
                orderId,
                request.menuItemId(),
                request.quantity()
        );
        return ResponseEntity.ok(savedItem);
    }

    // DTOs for capturing JSON requests
    public record OrderRequest(Long customerId, Long restaurantId) {}
    public record OrderItemRequest(Long menuItemId, Integer quantity) {}
}