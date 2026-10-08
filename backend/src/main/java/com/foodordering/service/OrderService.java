package com.foodordering.service;

import com.foodordering.model.Order;
import com.foodordering.model.OrderItem;
import com.foodordering.model.MenuItem;
import com.foodordering.repository.MenuItemRepository;
import com.foodordering.repository.OrderItemRepository;
import com.foodordering.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ASSIGNMENT REQUIREMENT: Display order details with JOIN
    public List<Map<String, Object>> getAllOrdersWithDetails() {
        // 1. Fetch orders joined with the restaurant table to get the name
        String orderSql = "SELECT o.id, o.order_date as orderDate, o.status, o.total_amount as totalAmount, " +
                "r.name as restaurantName " +
                "FROM orders o " +
                "JOIN restaurants r ON o.restaurant_id = r.id " +
                "ORDER BY o.id DESC";

        List<Map<String, Object>> orders = jdbcTemplate.queryForList(orderSql);

        // 2. Loop through each order and fetch its specific items using a JOIN
        for (Map<String, Object> order : orders) {
            Long orderId = ((Number) order.get("id")).longValue();

            String itemSql = "SELECT oi.quantity, oi.price, m.name as menuItemName " +
                    "FROM order_items oi " +
                    "JOIN menu_items m ON oi.menu_item_id = m.id " +
                    "WHERE oi.order_id = ?";

            List<Map<String, Object>> items = jdbcTemplate.queryForList(itemSql, orderId);

            // Inject the joined items list directly into the order response
            order.put("items", items);
        }

        return orders;
    }

    // ASSIGNMENT REQUIREMENT: Execute Place Order Procedure
    @Transactional
    public Long placeNewOrder(Long customerId, Long restaurantId) {
        // This directly calls your MySQL Stored Procedure and returns the new Order ID
        return orderRepository.callPlaceOrderProcedure(customerId, restaurantId);
    }

    // ASSIGNMENT REQUIREMENT: Add items (This will fire the MySQL Trigger!)
    @Transactional
    public OrderItem addOrderItem(Long orderId, Long menuItemId, Integer quantity) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu Item not found"));

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setMenuItem(menuItem);
        orderItem.setQuantity(quantity);
        orderItem.setPrice(menuItem.getPrice()); // Capture current price

        // Saving this item will fire the "after_order_item_insert" MySQL Trigger
        // which will automatically update the Order's total_amount and status!
        return orderItemRepository.save(orderItem);
    }
}