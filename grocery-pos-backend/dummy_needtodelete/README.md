
# Grocery POS Backend API

## Setup Instructions

1. **Database Setup**
   - Create a MySQL database named `grocery_pos`
   - Import the schema from `database/schema.sql`
   - Update database credentials in `config/database.php`

2. **Web Server Setup**
   - Place the backend folder in your web server directory (e.g., `/var/www/html/grocery-pos-backend/`)
   - Ensure Apache mod_rewrite is enabled
   - Make sure PHP has PDO MySQL extension enabled

3. **Frontend Configuration**
   - Update the API base URL in your React app to point to this backend
   - Example: `http://localhost/grocery-pos-backend/api/`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products` - Update product
- `DELETE /api/products?id={id}` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories` - Update category
- `DELETE /api/categories?id={id}` - Delete category

### Vendors
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors` - Update vendor
- `DELETE /api/vendors?id={id}` - Delete vendor

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction (complete sale)

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Database Schema

The database includes the following tables:
- `categories` - Product categories
- `vendors` - Supplier information
- `products` - Product inventory
- `transactions` - Sales transactions
- `transaction_items` - Individual items in each transaction
- `users` - Admin/cashier users
- `stock_movements` - Stock movement tracking

## Security Notes

- Change default database credentials
- Implement proper authentication for production
- Use HTTPS in production
- Validate and sanitize all inputs
- Implement rate limiting for API endpoints

## Sample Data

The schema includes sample data for:
- 6 categories (Vegetables, Fruits, Dairy, etc.)
- 4 vendors
- 8 products
- 2 users (admin/cashier)

Default login credentials:
- Username: admin, Password: password
- Username: cashier1, Password: password
