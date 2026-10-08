package com.foodordering.repository;

import com.foodordering.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // ASSIGNMENT REQUIREMENT: Display order details with customer and restaurant info.
    @Query("SELECT o FROM Order o JOIN FETCH o.customer c JOIN FETCH o.restaurant r")
    List<Order> findAllOrdersWithDetails();

    // ASSIGNMENT REQUIREMENT: Procedure to place an order
    @Procedure(procedureName = "place_order")
    Long callPlaceOrderProcedure(@Param("p_customer_id") Long customerId,
                                 @Param("p_restaurant_id") Long restaurantId);
}