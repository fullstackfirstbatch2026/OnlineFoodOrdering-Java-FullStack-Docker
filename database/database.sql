-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS food_ordering_db;
 ;

-- ==========================================
-- 1. DDL: TABLE CREATION (Lowercased for Spring Boot compatibility)
-- ==========================================

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER'
);

CREATE TABLE restaurants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(255)
);

CREATE TABLE menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    restaurant_id BIGINT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT,
    restaurant_id BIGINT,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'PENDING',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    menu_item_id BIGINT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- ==========================================
-- 2. ASSIGNMENT REQUIREMENTS: LOGIC
-- ==========================================

-- Function: Calculate the total value of an order
DELIMITER //
CREATE FUNCTION calculate_order_total(p_order_id BIGINT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10,2);

    SELECT SUM(quantity * price) INTO total
    FROM order_items
    WHERE order_id = p_order_id;

    RETURN IFNULL(total, 0.00);
END //
DELIMITER ;

-- Trigger: Update item/order status after order creation (when item is added)
DELIMITER //
CREATE TRIGGER after_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders
    SET total_amount = calculate_order_total(NEW.order_id),
        status = 'PROCESSING'
    WHERE id = NEW.order_id;
END //
DELIMITER ;

-- Procedure: Place an order
DELIMITER //
CREATE PROCEDURE place_order(
    IN p_customer_id BIGINT,
    IN p_restaurant_id BIGINT,
    OUT p_new_order_id BIGINT
)
BEGIN
    INSERT INTO orders (customer_id, restaurant_id, total_amount, status)
    VALUES (p_customer_id, p_restaurant_id, 0.00, 'PENDING');

    -- Capture the auto-generated ID of the newly inserted order
    SET p_new_order_id = LAST_INSERT_ID();
END //
DELIMITER ;

-- ==========================================
-- 3. DML: SEED DATA (Sample Data)
-- ==========================================

INSERT INTO customers (name, em ail, password, role) VALUES
('John Doe', 'john@example.com', 'password123', 'USER'),
('Admin User', 'admin@example.com', 'admin123', 'ADMIN'),
('Jane Smith', 'jane@example.com', 'password123', 'USER');

INSERT INTO restaurants (name, description, address) VALUES
('Burger Joint', 'Classic American burgers and fries.', '123 Main St'),
('Pizza Paradise', 'Authentic wood-fired Neapolitan pizzas.', '456 Elm St'),
('Sushi Zen', 'Fresh sushi and Japanese cuisine.', '789 Oak St');

INSERT INTO menu_items (name, price, category, restaurant_id) VALUES
('Classic Cheeseburger', 8.99, 'Mains', 1),
('French Fries', 3.99, 'Sides', 1),
('Margherita Pizza', 14.00, 'Mains', 2),
('Pepperoni Pizza', 16.50, 'Mains', 2),
('Spicy Tuna Roll', 9.50, 'Mains', 3),
('Miso Soup', 3.50, 'Starters', 3);

-- Create a couple of sample orders to test the high-value customer query
INSERT INTO orders (customer_id, restaurant_id, total_amount, status) VALUES
(1, 1, 12.98, 'COMPLETED'),
(3, 2, 30.50, 'COMPLETED');