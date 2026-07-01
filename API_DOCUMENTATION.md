# 🍴 Carimakan Backend API Documentation

## 📚 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication
Gunakan JWT token di header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 👤 AUTH ENDPOINTS

### 1. Register
```
POST /auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
**Response (201):**
```json
{
  "message": "Registrasi berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (200):**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Get Profile
```
GET /auth/profile
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08123456789",
  "address": "Jl. Merdeka No. 123",
  "favorites": [],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 4. Update Profile
```
PUT /auth/profile
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "08987654321",
  "address": "Jl. Sudirman No. 456"
}
```
**Response (200):**
```json
{
  "message": "Profil berhasil diupdate",
  "user": { ... }
}
```

---

## ⭐ FAVORITES ENDPOINTS

### 1. Get Favorites
```
GET /auth/favorites
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "mealId": "52772",
    "mealName": "Teriyaki Chicken Plate",
    "mealImage": "https://www.themealdb.com/images/media/meals/..."
  }
]
```

### 2. Add to Favorites
```
POST /auth/favorites
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Body:**
```json
{
  "mealId": "52772",
  "mealName": "Teriyaki Chicken Plate",
  "mealImage": "https://www.themealdb.com/images/media/meals/..."
}
```
**Response (200):**
```json
{
  "message": "Ditambahkan ke favorit",
  "favorites": [ ... ]
}
```

### 3. Remove from Favorites
```
DELETE /auth/favorites
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Body:**
```json
{
  "mealId": "52772"
}
```
**Response (200):**
```json
{
  "message": "Dihapus dari favorit",
  "favorites": [ ... ]
}
```

---

## 🍽️ MEALS ENDPOINTS

### 1. Search Meals
```
GET /meals/search?s=chicken
```
**Response (200):**
```json
{
  "meals": [
    {
      "idMeal": "52772",
      "strMeal": "Teriyaki Chicken Plate",
      "strMealThumb": "https://www.themealdb.com/images/media/meals/..."
    }
  ]
}
```

### 2. Get Meal Detail
```
GET /meals/:id
```
Example: `GET /meals/52772`

**Response (200):**
```json
{
  "meals": [
    {
      "idMeal": "52772",
      "strMeal": "Teriyaki Chicken Plate",
      "strInstructions": "Marinate chicken...",
      "strMealThumb": "https://www.themealdb.com/images/media/meals/..."
    }
  ]
}
```

### 3. Get Random Meal
```
GET /meals/random
```
**Response (200):** Same as detail endpoint

### 4. Get Meals by Category
```
GET /meals/category/:category
```
Example: `GET /meals/category/Seafood`

---

## 📦 ORDERS ENDPOINTS

### 1. Create Order
```
POST /orders
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Body:**
```json
{
  "meals": [
    {
      "mealId": "52772",
      "mealName": "Teriyaki Chicken Plate",
      "quantity": 2,
      "price": 50000
    }
  ],
  "totalAmount": 100000,
  "shippingAddress": "Jl. Merdeka No. 123",
  "notes": "Extra spicy"
}
```
**Response (201):**
```json
{
  "message": "Order berhasil dibuat",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "meals": [ ... ],
    "totalAmount": 100000,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get All Orders
```
GET /orders
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "status": "pending",
    "totalAmount": 100000,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### 3. Get Order Detail
```
GET /orders/:orderId
```
**Headers:** Butuh `Authorization: Bearer <token>`

### 4. Update Order Status
```
PUT /orders/:orderId/status
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Body:**
```json
{
  "status": "processing"
}
```
**Valid status:** `pending`, `processing`, `completed`, `cancelled`

### 5. Cancel Order
```
PUT /orders/:orderId/cancel
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Order berhasil dibatalkan",
  "order": { ... }
}
```

---

## 💳 PAYMENTS ENDPOINTS

### 1. Create Payment
```
POST /payments
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439012",
  "amount": 100000,
  "method": "stripe"
}
```
**Valid method:** `stripe`, `midtrans`, `bank_transfer`

**Response (201):**
```json
{
  "message": "Payment intent created",
  "payment": {
    "_id": "507f1f77bcf86cd799439013",
    "orderId": "507f1f77bcf86cd799439012",
    "amount": 100000,
    "method": "stripe",
    "status": "pending",
    "paymentDetails": {
      "clientSecret": "pi_xxxx_secret_xxxx",
      "publishableKey": "pk_test_xxxx"
    }
  },
  "clientSecret": "pi_xxxx_secret_xxxx"
}
```

### 2. Confirm Payment
```
POST /payments/:paymentId/confirm
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Body:**
```json
{
  "paymentIntentId": "pi_xxxx"
}
```
**Response (200):**
```json
{
  "message": "Payment berhasil",
  "payment": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "success",
    "transactionId": "pi_xxxx"
  },
  "order": {
    "status": "processing",
    "paymentStatus": "paid"
  }
}
```

### 3. Get Payment History
```
GET /payments/history
```
**Headers:** Butuh `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "orderId": { ... },
    "amount": 100000,
    "status": "success",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## ✅ Health Check
```
GET /health
```
**Response (200):**
```json
{
  "status": "Backend server is running",
  "database": "connected"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{ "error": "Lengkapi semua field" }
```

### 401 Unauthorized
```json
{ "error": "No token provided" }
```

### 403 Forbidden
```json
{ "error": "Tidak punya akses ke order ini" }
```

### 404 Not Found
```json
{ "error": "Order tidak ditemukan" }
```

### 500 Internal Server Error
```json
{ "error": "Gagal buat payment" }
```

---

## 🔄 Quick Start

### 1. Register & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### 2. Use Token untuk protected routes
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Search Meals
```bash
curl -X GET "http://localhost:5000/api/meals/search?s=chicken"
```

### 4. Create Order & Payment
```bash
# Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{...}'

# Create payment
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{...}'
```
