
-- Drop existing tables if they exist
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS store_settings;

-- Table structure for users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(100),
    profile_image VARCHAR(255),
    role ENUM('admin', 'manager', 'cashier') DEFAULT 'cashier',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Table structure for store settings
CREATE TABLE store_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    store_address TEXT,
    store_phone VARCHAR(20),
    store_email VARCHAR(100),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    logo_url VARCHAR(255),
    receipt_footer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table structure for vendors
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    description TEXT,
    gst_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_contact (contact)
);

-- Table structure for categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_name (name),
    INDEX idx_name (name)
);

-- Enhanced subcategories table
CREATE TABLE subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subcategory_per_category (name, category_id),
    INDEX idx_category (category_id)
);

-- Enhanced transactions table with bill number
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi') NOT NULL DEFAULT 'cash',
    customer_name VARCHAR(100),
    customer_phone VARCHAR(15),
    customer_email VARCHAR(100),
    notes TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_bill_number (bill_number),
    INDEX idx_transaction_date (created_at),
    INDEX idx_user (user_id)
);

-- Enhanced products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    description TEXT,
    category_id INT NOT NULL,
    subcategory_id INT,
    vendor_id INT,
    unit_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    stock DECIMAL(10,3) DEFAULT 0,
    min_stock DECIMAL(10,3) DEFAULT 0,
    max_stock DECIMAL(10,3) DEFAULT 1000,
    image VARCHAR(255),
    unit ENUM('kg', 'gram', 'litre', 'ml', 'piece', 'packet', 'dozen') NOT NULL DEFAULT 'piece',
    min_quantity DECIMAL(10,3) DEFAULT 1,
    small_unit VARCHAR(50),
    conversion_factor DECIMAL(10,3) DEFAULT 1,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    discount_rate DECIMAL(5,2) DEFAULT 0,
    expiry_date DATE,
    batch_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_barcode (barcode),
    INDEX idx_category (category_id),
    INDEX idx_subcategory (subcategory_id),
    INDEX idx_vendor (vendor_id),
    INDEX idx_stock_level (stock, min_stock)
);

-- Enhanced transaction_items table
CREATE TABLE transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_transaction_product (transaction_id, product_id)
);

-- Enhanced stock_movements table
CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    movement_type ENUM('in', 'out') NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    reference_type ENUM('purchase', 'sale', 'adjustment', 'opening_stock', 'waste', 'return') NOT NULL,
    reference_id INT,
    reference_number VARCHAR(50),
    supplier_id INT,
    batch_number VARCHAR(50),
    expiry_date DATE,
    notes TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_product (product_id),
    INDEX idx_movement_type (movement_type),
    INDEX idx_reference (reference_type, reference_id),
    INDEX idx_date (created_at),
    INDEX idx_supplier (supplier_id)
);

-- INSERT SAMPLE DATA

-- Insert store settings
INSERT INTO store_settings (store_name, store_address, store_phone, store_email, tax_rate, currency, receipt_footer) 
VALUES ('Fresh Mart Grocery Store', '123 Main Street, Chennai, Tamil Nadu 600001', '+91 9876543210', 'store@freshmart.com', 18.00, 'INR', 'Thank you for shopping with us! Visit again soon.');

-- Insert users
INSERT INTO users (username, password, email, full_name, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@freshmart.com', 'Store Administrator', 'admin'),
('manager1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager@freshmart.com', 'Store Manager', 'manager'),
('cashier1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cashier1@freshmart.com', 'Rajesh Kumar', 'cashier'),
('cashier2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cashier2@freshmart.com', 'Priya Sharma', 'cashier');

-- Insert vendors
INSERT INTO vendors (name, contact, email, address, description, gst_number, is_active) VALUES
('Fresh Farm Co.', '+91 9876543210', 'contact@freshfarm.com', 'Koyambedu Market, Chennai, Tamil Nadu', 'Premium fresh vegetables and fruits supplier', '33AABCF1234A1Z5', TRUE),
('Dairy Fresh Ltd.', '+91 9876543211', 'orders@dairyfresh.com', 'Ambattur, Chennai, Tamil Nadu', 'Milk and dairy products distributor', '33AABCD5678B2Y6', TRUE),
('Spice World Traders', '+91 9876543212', 'info@spiceworld.com', 'Perambur, Chennai, Tamil Nadu', 'Wholesale spices and condiments supplier', '33AABCE9012C3X7', TRUE),
('Grain Master Co.', '+91 9876543213', 'sales@grainmaster.com', 'Tondiarpet, Chennai, Tamil Nadu', 'Rice, wheat and other grains supplier', '33AABCF3456D4W8', TRUE),
('Snack Factory', '+91 9876543214', 'orders@snackfactory.com', 'Guindy, Chennai, Tamil Nadu', 'Packaged snacks and beverages distributor', '33AABCG7890E5V9', TRUE),
('Clean Home Supplies', '+91 9876543215', 'contact@cleanhome.com', 'T.Nagar, Chennai, Tamil Nadu', 'Household cleaning products supplier', '33AABCH1234F6U0', TRUE);

-- Insert categories
INSERT INTO categories (name, description, is_active) VALUES
('Vegetables', 'Fresh vegetables and leafy greens', TRUE),
('Fruits', 'Fresh seasonal fruits', TRUE),
('Dairy Products', 'Milk, cheese, yogurt and dairy items', TRUE),
('Grains & Cereals', 'Rice, wheat, quinoa and other grains', TRUE),
('Spices & Condiments', 'Cooking spices, sauces and seasonings', TRUE),
('Snacks & Beverages', 'Packaged snacks, soft drinks and juices', TRUE),
('Household Items', 'Cleaning supplies and household necessities', TRUE),
('Frozen Foods', 'Frozen vegetables, fruits and ready meals', TRUE);

-- Insert subcategories
INSERT INTO subcategories (name, category_id, description, is_active) VALUES
-- Vegetables subcategories
('Leafy Greens', 1, 'Spinach, lettuce, cabbage, etc.', TRUE),
('Root Vegetables', 1, 'Carrots, potatoes, onions, etc.', TRUE),
('Gourds', 1, 'Bottle gourd, ridge gourd, bitter gourd, etc.', TRUE),
('Tomatoes & Capsicum', 1, 'Tomatoes, bell peppers, chili peppers', TRUE),

-- Fruits subcategories
('Citrus Fruits', 2, 'Oranges, lemons, limes, grapefruits', TRUE),
('Tropical Fruits', 2, 'Mangoes, pineapples, papayas, coconuts', TRUE),
('Seasonal Fruits', 2, 'Apples, grapes, pomegranates, bananas', TRUE),
('Berries', 2, 'Strawberries, blueberries, blackberries', TRUE),

-- Dairy subcategories
('Milk', 3, 'Fresh milk, flavored milk, condensed milk', TRUE),
('Cheese & Paneer', 3, 'Various types of cheese and fresh paneer', TRUE),
('Yogurt & Curd', 3, 'Plain and flavored yogurt, fresh curd', TRUE),
('Butter & Ghee', 3, 'Butter, ghee, margarine', TRUE),

-- Grains subcategories
('Rice', 4, 'Basmati, regular, brown rice varieties', TRUE),
('Wheat Products', 4, 'Wheat flour, whole wheat, semolina', TRUE),
('Pulses & Lentils', 4, 'Dal, beans, chickpeas, lentils', TRUE),
('Breakfast Cereals', 4, 'Oats, cornflakes, muesli', TRUE),

-- Spices subcategories
('Whole Spices', 5, 'Cardamom, cinnamon, cloves, bay leaves', TRUE),
('Ground Spices', 5, 'Turmeric, chili powder, coriander powder', TRUE),
('Masala Blends', 5, 'Garam masala, sambar powder, curry powder', TRUE),
('Sauces & Pastes', 5, 'Tomato sauce, chili sauce, ginger-garlic paste', TRUE),

-- Snacks subcategories
('Chips & Crisps', 6, 'Potato chips, banana chips, nachos', TRUE),
('Biscuits & Cookies', 6, 'Sweet and savory biscuits, cookies', TRUE),
('Soft Drinks', 6, 'Carbonated drinks, energy drinks', TRUE),
('Juices', 6, 'Fresh juices, packaged fruit juices', TRUE),

-- Household subcategories
('Cleaning Supplies', 7, 'Detergents, floor cleaners, dish wash', TRUE),
('Personal Care', 7, 'Soaps, shampoos, toothpaste', TRUE),
('Kitchen Essentials', 7, 'Foil, plastic bags, containers', TRUE);

-- Insert products
INSERT INTO products (name, barcode, description, category_id, subcategory_id, vendor_id, unit_price, selling_price, stock, min_stock, max_stock, unit, min_quantity, tax_rate, discount_rate, is_active) VALUES
-- Vegetables
('Fresh Tomatoes', '8901030001234', 'Fresh red tomatoes, locally sourced', 1, 4, 1, 35.00, 40.00, 50.500, 5.000, 100.000, 'kg', 0.250, 0.00, 0.00, TRUE),
('Onions', '8901030001235', 'Fresh onions, premium quality', 1, 2, 1, 25.00, 30.00, 75.250, 10.000, 150.000, 'kg', 0.250, 0.00, 0.00, TRUE),
('Potatoes', '8901030001236', 'Fresh potatoes, washed and sorted', 1, 2, 1, 20.00, 25.00, 100.750, 15.000, 200.000, 'kg', 0.500, 0.00, 0.00, TRUE),
('Spinach', '8901030001237', 'Fresh green spinach leaves', 1, 1, 1, 15.00, 20.00, 25.500, 2.000, 50.000, 'kg', 0.250, 0.00, 0.00, TRUE),
('Carrots', '8901030001238', 'Fresh orange carrots', 1, 2, 1, 30.00, 35.00, 40.250, 5.000, 80.000, 'kg', 0.250, 0.00, 0.00, TRUE),

-- Fruits
('Bananas', '8901030002234', 'Fresh yellow bananas', 2, 7, 1, 40.00, 50.00, 30.000, 5.000, 100.000, 'kg', 0.500, 0.00, 0.00, TRUE),
('Apples', '8901030002235', 'Fresh red apples, imported', 2, 7, 1, 120.00, 150.00, 25.000, 5.000, 50.000, 'kg', 0.250, 0.00, 0.00, TRUE),
('Oranges', '8901030002236', 'Fresh sweet oranges', 2, 5, 1, 60.00, 80.00, 35.500, 5.000, 70.000, 'kg', 0.500, 0.00, 0.00, TRUE),
('Mangoes', '8901030002237', 'Fresh Alphonso mangoes', 2, 6, 1, 200.00, 250.00, 20.000, 3.000, 50.000, 'kg', 0.250, 0.00, 0.00, TRUE),

-- Dairy Products
('Fresh Milk', '8901030003234', 'Full cream fresh milk', 3, 9, 2, 25.00, 30.00, 50.000, 10.000, 100.000, 'litre', 0.500, 0.00, 0.00, TRUE),
('Paneer', '8901030003235', 'Fresh cottage cheese', 3, 10, 2, 180.00, 220.00, 15.000, 2.000, 30.000, 'kg', 0.250, 0.00, 0.00, TRUE),
('Greek Yogurt', '8901030003236', 'Thick Greek style yogurt', 3, 11, 2, 80.00, 100.00, 25.000, 5.000, 50.000, 'kg', 0.200, 0.00, 0.00, TRUE),
('Butter', '8901030003237', 'Unsalted fresh butter', 3, 12, 2, 350.00, 400.00, 10.000, 2.000, 20.000, 'kg', 0.100, 0.00, 0.00, TRUE),

-- Grains & Cereals
('Basmati Rice', '8901030004234', 'Premium aged basmati rice', 4, 13, 4, 80.00, 100.00, 200.000, 25.000, 500.000, 'kg', 1.000, 0.00, 0.00, TRUE),
('Wheat Flour', '8901030004235', 'Whole wheat flour', 4, 14, 4, 35.00, 45.00, 150.000, 20.000, 300.000, 'kg', 1.000, 0.00, 0.00, TRUE),
('Toor Dal', '8901030004236', 'Premium quality toor dal', 4, 15, 4, 90.00, 110.00, 100.000, 15.000, 200.000, 'kg', 0.500, 0.00, 0.00, TRUE),
('Rolled Oats', '8901030004237', 'Healthy breakfast oats', 4, 16, 4, 120.00, 150.00, 50.000, 10.000, 100.000, 'kg', 0.500, 0.00, 0.00, TRUE),

-- Spices & Condiments
('Turmeric Powder', '8901030005234', 'Pure turmeric powder', 5, 18, 3, 80.00, 100.00, 25.000, 3.000, 50.000, 'kg', 0.100, 0.00, 0.00, TRUE),
('Garam Masala', '8901030005235', 'Aromatic garam masala blend', 5, 19, 3, 200.00, 250.00, 15.000, 2.000, 30.000, 'kg', 0.050, 0.00, 0.00, TRUE),
('Tomato Ketchup', '8901030005236', 'Tangy tomato ketchup', 5, 20, 3, 40.00, 50.00, 30.000, 5.000, 60.000, 'kg', 0.200, 18.00, 0.00, TRUE),

-- Snacks & Beverages
('Potato Chips', '8901030006234', 'Crispy salted potato chips', 6, 21, 5, 80.00, 100.00, 40.000, 10.000, 100.000, 'packet', 1.000, 18.00, 0.00, TRUE),
('Coca Cola', '8901030006235', 'Refreshing cola drink', 6, 23, 5, 35.00, 45.00, 60.000, 12.000, 120.000, 'litre', 0.600, 18.00, 0.00, TRUE),
('Orange Juice', '8901030006236', 'Fresh orange juice', 6, 24, 5, 80.00, 100.00, 25.000, 5.000, 50.000, 'litre', 0.200, 18.00, 0.00, TRUE),

-- Household Items
('Dish Wash Liquid', '8901030007234', 'Effective dish washing liquid', 7, 25, 6, 120.00, 150.00, 30.000, 5.000, 60.000, 'litre', 0.500, 18.00, 0.00, TRUE),
('Laundry Detergent', '8901030007235', 'Premium laundry detergent powder', 7, 25, 6, 200.00, 250.00, 20.000, 3.000, 40.000, 'kg', 1.000, 18.00, 0.00, TRUE),
('Toilet Paper', '8901030007236', 'Soft toilet tissue paper', 7, 27, 6, 150.00, 180.00, 50.000, 10.000, 100.000, 'packet', 1.000, 18.00, 0.00, TRUE);

-- Insert sample transactions
INSERT INTO transactions (transaction_number, bill_number, subtotal, tax_amount, discount_amount, total_amount, payment_method, customer_name, customer_phone, user_id) VALUES
('TXN001', 'BILL001', 185.00, 33.30, 0.00, 218.30, 'cash', 'Ramesh Kumar', '+91 9876543216', 3),
('TXN002', 'BILL002', 320.00, 57.60, 10.00, 367.60, 'card', 'Priya Patel', '+91 9876543217', 3),
('TXN003', 'BILL003', 455.00, 81.90, 0.00, 536.90, 'upi', 'Suresh Reddy', '+91 9876543218', 4),
('TXN004', 'BILL004', 278.00, 50.04, 5.00, 323.04, 'cash', 'Anita Sharma', '+91 9876543219', 3),
('TXN005', 'BILL005', 167.00, 30.06, 0.00, 197.06, 'card', 'Rajesh Gupta', '+91 9876543220', 4);

-- Insert transaction items
INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price, tax_amount) VALUES
-- Transaction 1 items
(1, 1, 2.000, 40.00, 80.00, 0.00),
(1, 3, 1.000, 25.00, 25.00, 0.00),
(1, 10, 1.000, 30.00, 30.00, 0.00),
(1, 21, 1.000, 50.00, 50.00, 9.00),

-- Transaction 2 items
(2, 7, 1.000, 150.00, 150.00, 0.00),
(2, 11, 0.500, 220.00, 110.00, 0.00),
(2, 22, 1.000, 100.00, 100.00, 18.00),

-- Transaction 3 items
(3, 15, 2.000, 100.00, 200.00, 0.00),
(3, 16, 1.000, 45.00, 45.00, 0.00),
(3, 24, 2.000, 150.00, 300.00, 54.00),

-- Transaction 4 items
(4, 2, 1.000, 30.00, 30.00, 0.00),
(4, 5, 1.000, 35.00, 35.00, 0.00),
(4, 9, 1.000, 80.00, 80.00, 0.00),
(4, 23, 2.000, 45.00, 90.00, 16.20),
(4, 25, 1.000, 150.00, 150.00, 27.00),

-- Transaction 5 items
(5, 6, 1.000, 50.00, 50.00, 0.00),
(5, 8, 0.500, 80.00, 40.00, 0.00),
(5, 14, 0.500, 150.00, 75.00, 0.00);

-- Insert stock movements
INSERT INTO stock_movements (product_id, movement_type, quantity, unit_cost, total_cost, reference_type, reference_number, supplier_id, notes, user_id) VALUES
-- Opening stock entries
(1, 'in', 100.000, 35.00, 3500.00, 'opening_stock', 'OPEN001', 1, 'Initial stock entry for tomatoes', 1),
(2, 'in', 150.000, 25.00, 3750.00, 'opening_stock', 'OPEN002', 1, 'Initial stock entry for onions', 1),
(3, 'in', 200.000, 20.00, 4000.00, 'opening_stock', 'OPEN003', 1, 'Initial stock entry for potatoes', 1),
(10, 'in', 100.000, 25.00, 2500.00, 'opening_stock', 'OPEN004', 2, 'Initial stock entry for milk', 1),
(15, 'in', 300.000, 80.00, 24000.00, 'opening_stock', 'OPEN005', 4, 'Initial stock entry for basmati rice', 1),

-- Purchase entries
(1, 'in', 50.000, 35.00, 1750.00, 'purchase', 'PUR001', 1, 'Fresh tomato purchase', 1),
(7, 'in', 30.000, 120.00, 3600.00, 'purchase', 'PUR002', 1, 'Apple purchase for weekend sale', 1),
(21, 'in', 50.000, 80.00, 4000.00, 'purchase', 'PUR003', 5, 'Potato chips stock replenishment', 1),

-- Sales entries (from transactions)
(1, 'out', 2.000, 40.00, 80.00, 'sale', 'BILL001', NULL, 'Sale to customer Ramesh Kumar', 3),
(3, 'out', 1.000, 25.00, 25.00, 'sale', 'BILL001', NULL, 'Sale to customer Ramesh Kumar', 3),
(10, 'out', 1.000, 30.00, 30.00, 'sale', 'BILL001', NULL, 'Sale to customer Ramesh Kumar', 3),
(7, 'out', 1.000, 150.00, 150.00, 'sale', 'BILL002', NULL, 'Sale to customer Priya Patel', 3),
(11, 'out', 0.500, 220.00, 110.00, 'sale', 'BILL002', NULL, 'Sale to customer Priya Patel', 3),

-- Adjustment entries
(4, 'in', 5.000, 15.00, 75.00, 'adjustment', 'ADJ001', NULL, 'Stock adjustment after physical count', 2),
(1, 'out', 0.500, 35.00, 17.50, 'waste', 'WASTE001', NULL, 'Damaged tomatoes disposed', 2);
