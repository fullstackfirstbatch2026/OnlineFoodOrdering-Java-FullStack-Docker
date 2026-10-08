# 🍔 Docker Eats – Online Food Ordering

A full-stack online food ordering application. Customers can browse restaurants, view menus, build a cart, place orders and track their order history. The whole stack runs in Docker with a single command.

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | Vanilla HTML, CSS, JavaScript (served by Nginx) |
| Backend  | Java 17, Spring Boot 3.2.3, Spring Data JPA  |
| Database | MySQL 8.0 (stored procedure, function, trigger) |
| DevOps   | Docker, Docker Compose                       |

---

## ✨ Features

- **Browse restaurants** with live search
- **Menu pages** with category filters and in-menu search
- **Smart cart** – quantity steppers, one restaurant per order, persistent via `localStorage`
- **Checkout** that calls a MySQL stored procedure and fires a trigger to calculate totals
- **Order history** with receipt-style cards and status badges
- **User registration and login**
- **Responsive UI** with mobile navigation and automatic dark mode

---

## 🏗️ Architecture

```
┌────────────┐   HTTP    ┌──────────────────┐   JDBC   ┌──────────────┐
│  Browser   │ ────────► │  Spring Boot API │ ───────► │  MySQL 8.0   │
│ (Nginx :80)│  :8080    │   (port 8080)    │          │ (host :3307) │
└────────────┘           └──────────────────┘          └──────────────┘
```

Three containers are defined in `docker-compose.yml`:

| Service    | Container       | Port (host → container) |
| ---------- | --------------- | ----------------------- |
| `frontend` | `food_frontend` | `80 → 80`               |
| `backend`  | `food_backend`  | `8080 → 8080`           |
| `db`       | `food_db`       | `3307 → 3306`           |

---

## 📁 Project Structure

```
OnlineFoodOrdering-Java-FullStack-Docker/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/foodordering/
│       ├── controller/    # REST controllers (Customer, Restaurant, Order)
│       ├── model/         # JPA entities
│       ├── repository/    # Spring Data repositories
│       └── service/       # Business logic
├── database/
│   └── database.sql       # Schema, function, trigger, procedure, seed data
├── frontend/
│   ├── css/style.css      # Shared design system
│   ├── js/
│   │   ├── api.js         # fetch wrapper
│   │   ├── common.js      # navbar, toasts, cart store, helpers
│   │   └── *.js           # page scripts (home, restaurants, menu, cart, orders, auth)
│   └── *.html             # index, restaurants, menu, cart, orders, login, register
└── docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- Ports **80**, **8080** and **3307** free on your machine

### Run the app

```bash
# from the project root
docker-compose up --build
```

The first build downloads Maven dependencies and can take several minutes. Later builds are fast thanks to Docker layer caching, so avoid `--no-cache` unless you need it.

Then open:

| What     | URL                                     |
| -------- | --------------------------------------- |
| Website  | http://localhost                        |
| REST API | http://localhost:8080/api/restaurants   |

### Stop the app

```bash
docker-compose down          # stop containers, keep database data
docker-compose down -v       # stop containers AND delete the database volume
```

### Frontend-only changes

The `frontend/` folder is mounted straight into Nginx, so you don't need to rebuild. Edit a file and hard-refresh the browser (`Ctrl + F5`).

---

## 🔑 Demo Accounts

Seeded by `database/database.sql`:

| Role  | Email               | Password      |
| ----- | ------------------- | ------------- |
| User  | `john@example.com`  | `password123` |
| User  | `jane@example.com`  | `password123` |
| Admin | `admin@example.com` | `admin123`    |

You can also create a new account on the Sign up page.

---

## 🔌 API Reference

Base URL: `http://localhost:8080/api`

### Customers

| Method | Endpoint                   | Description                         |
| ------ | -------------------------- | ----------------------------------- |
| GET    | `/customers`               | List all customers                  |
| GET    | `/customers/high-value`    | Customers with high order value     |
| POST   | `/customers/register`      | Register `{ name, email, password, role }` |
| POST   | `/customers/login`         | Login `{ email, password }`         |

### Restaurants

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| GET    | `/restaurants`               | List restaurants           |
| GET    | `/restaurants/{id}`          | Get one restaurant         |
| GET    | `/restaurants/{id}/menu`     | Menu items of a restaurant |
| POST   | `/restaurants`               | Create a restaurant        |

### Orders

| Method | Endpoint                 | Description                                              |
| ------ | ------------------------ | -------------------------------------------------------- |
| GET    | `/orders`                | All orders with joined restaurant name and items         |
| POST   | `/orders`                | Create an order `{ customerId, restaurantId }` (calls `place_order` procedure) |
| POST   | `/orders/{id}/items`     | Add an item `{ menuItemId, quantity }` (fires the totals trigger) |

---

## 🗄️ Database

`database/database.sql` runs automatically the first time the MySQL container starts. It creates:

- **Tables:** `customers`, `restaurants`, `menu_items`, `orders`, `order_items`
- **Function:** `calculate_order_total(order_id)`
- **Trigger:** `after_order_item_insert` – recalculates the order total and sets status to `PROCESSING`
- **Procedure:** `place_order(customer_id, restaurant_id, OUT new_order_id)`
- **Seed data:** sample customers, restaurants, menu items and orders

To connect with a MySQL client from your host, use port **3307**, user `root`, database `food_ordering_db`.

> The init script only runs on an empty volume. To re-seed, run `docker-compose down -v` and start again.

---

## 🛠️ Troubleshooting

| Problem | Fix |
| ------- | --- |
| Build is very slow | The Maven dependency download is the slow step. Don't use `--no-cache`, and check Docker Desktop's DNS/VPN settings. |
| Frontend shows "Cannot reach the server" | Make sure the `food_backend` container is running: `docker-compose ps` and `docker-compose logs backend`. |
| Backend can't connect to MySQL | Wait for the `db` health check to pass, or inspect `docker-compose logs db`. |
| Port already in use | Stop the other service using it, or change the host port in `docker-compose.yml`. |
| CSS/JS changes don't appear | Hard refresh with `Ctrl + F5`. |
| Seed data missing | Remove the volume with `docker-compose down -v` and start again. |

---

## ⚠️ Known Limitations

- Passwords are stored and compared in **plain text**. Add hashing (e.g. BCrypt) and token-based auth before any real deployment.
- `GET /api/orders` returns orders for **all** customers; there is no per-customer filter yet.
- Database credentials are hard-coded in `docker-compose.yml`. Move them to an `.env` file for anything beyond local development.
- The seed script contains a typo (`em ail`) in the `customers` insert that should be fixed.

---

## 🗺️ Roadmap Ideas

- Per-customer order endpoint (`/orders/customer/{id}`)
- Password hashing and JWT authentication
- Admin dashboard for managing restaurants and menus
- Order status updates and live tracking
- Payment integration

---

## 📄 License

This project was built for learning purposes. Add a license of your choice before sharing publicly.
