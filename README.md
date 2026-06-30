# Carimakan Backend - Complete Setup Guide

## 📋 Apa yang Sudah Diimplementasi

### ✅ Core Infrastructure
- Express.js server with CORS
- MongoDB integration dengan Mongoose
- Environment configuration (dotenv)
- Error handling middleware

### ✅ Authentication System
- User registration & login
- JWT token-based authentication
- Password hashing dengan bcryptjs
- Protected routes with auth middleware
- Profile management
- Favorites system

### ✅ Orders Management
- Create orders
- View order history
- Order status tracking
- Cancel orders
- Order detail retrieval

### ✅ Payment Integration
- Stripe payment processing
- Payment status tracking
- Payment history
- Multiple payment methods support

### ✅ Meals API
- Integration dengan TheMealDB API
- Search meals
- Get meal details
- Random meal
- Meals by category

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v14 atau lebih tinggi)
- MongoDB (local atau cloud: MongoDB Atlas)
- npm atau yarn

### 2. Installation

```bash
# Navigate ke backend folder
cd carimakan-backend

# Install dependencies
npm install

# Setup MongoDB
# Option A: Lokal
# Pastikan MongoDB sudah running
mongod

# Option B: MongoDB Atlas
# Buat cluster di https://www.mongodb.com/cloud/atlas
# Copy connection string
```

### 3. Environment Variables

Edit `.env` file:
```env
PORT=5000
THEMEALDB_API=https://www.themealdb.com/api/json/v1/1
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/carimakan
# Atau untuk MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/carimakan?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_PUBLIC_KEY=pk_test_your_stripe_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Output:
```
🍴 Backend server running on port 5000
📡 Endpoints: http://localhost:5000
✅ MongoDB connected successfully
```

### 5. Run Production Server

```bash
npm start
```

---

## 📁 Project Structure

```
carimakan-backend/
├── controllers/
│   ├── authController.js       # Auth logic
│   ├── orderController.js      # Order management
│   └── paymentController.js    # Payment processing
├── middleware/
│   └── auth.js                 # JWT authentication
├── models/
│   ├── User.js                 # User schema
│   ├── Order.js                # Order schema
│   └── Payment.js              # Payment schema
├── routes/
│   ├── auth.js                 # Auth endpoints
│   ├── orders.js               # Order endpoints
│   ├── payments.js             # Payment endpoints
│   └── meals.js                # Meals endpoints
├── .env                        # Environment variables
├── .gitignore                  # Git ignore
├── package.json                # Dependencies
├── server.js                   # Main server file
├── API_DOCUMENTATION.md        # API docs
└── README.md                   # This file
```

---

## 🔌 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Favorites
- `GET /api/auth/favorites` - Get favorites
- `POST /api/auth/favorites` - Add favorite
- `DELETE /api/auth/favorites` - Remove favorite

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId` - Get order detail
- `PUT /api/orders/:orderId/status` - Update status
- `PUT /api/orders/:orderId/cancel` - Cancel order

### Payments
- `POST /api/payments` - Create payment
- `POST /api/payments/:paymentId/confirm` - Confirm payment
- `GET /api/payments/history` - Payment history

### Meals
- `GET /api/meals/search?s=keyword` - Search meals
- `GET /api/meals/:id` - Get meal detail
- `GET /api/meals/random` - Random meal
- `GET /api/meals/category/:category` - By category

---

## 🔑 Key Features

### 1. Authentication
```javascript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response includes JWT token
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### 2. Protected Routes
```javascript
// Use token dalam header
GET /api/auth/profile
Authorization: Bearer <token>
```

### 3. Orders with Payment
```javascript
// Create order
POST /api/orders
{
  "meals": [...],
  "totalAmount": 100000,
  "shippingAddress": "..."
}

// Create payment
POST /api/payments
{
  "orderId": "...",
  "amount": 100000,
  "method": "stripe"
}
```

---

## 🔒 Security Features

✅ Password hashing dengan bcryptjs
✅ JWT token authentication
✅ CORS enabled
✅ Protected routes dengan middleware
✅ Environment variables untuk sensitive data
✅ Error handling untuk mencegah information leakage

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Pastikan MongoDB sudah running
```bash
# Windows
mongod

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Ubah PORT di .env atau kill process yang menggunakan port 5000

### JWT Secret Error
```
Error: Invalid token
```
**Solution:** Pastikan JWT token dikirim dengan format:
```
Authorization: Bearer <your_token>
```

### Stripe Error
```
Error: Invalid API key provided
```
**Solution:** Update STRIPE_SECRET_KEY di .env dengan key yang benar

---

## 📊 Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  favorites: Array,
  createdAt: Date
}
```

### Order Schema
```javascript
{
  userId: ObjectId,
  meals: Array,
  totalAmount: Number,
  status: String (pending/processing/completed/cancelled),
  paymentStatus: String (pending/paid/failed),
  shippingAddress: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Schema
```javascript
{
  orderId: ObjectId,
  userId: ObjectId,
  amount: Number,
  method: String (stripe/midtrans/bank_transfer),
  status: String (pending/processing/success/failed),
  transactionId: String,
  paymentDetails: Object,
  createdAt: Date
}
```

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "axios": "^1.4.0",
  "mongoose": "^7.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "socket.io": "^4.6.1",
  "stripe": "^12.0.0"
}
```

---

## 🔄 Next Steps

1. **Frontend Integration:**
   - Buat auth context di React
   - Setup axios interceptor untuk JWT
   - Buat login/register pages
   - Integrate order form

2. **Real-time Features:**
   - Setup Socket.io untuk live updates
   - Order status notifications
   - Live chat support

3. **Additional Features:**
   - Email verification
   - Password reset
   - User roles & permissions
   - Admin dashboard

4. **Testing:**
   - Unit tests
   - Integration tests
   - API testing dengan Postman

---

## 🤝 Contributing

Untuk menambah fitur:
1. Buat branch baru: `git checkout -b feature/nama-fitur`
2. Commit changes: `git commit -am 'Add feature'`
3. Push ke branch: `git push origin feature/nama-fitur`
4. Submit pull request

---

## 📝 License

MIT License

---

## 💬 Support

Untuk bantuan, buat issue di GitHub atau hubungi tim development.

---

**Created:** 2024-01-15
**Last Updated:** 2024-01-15
**Version:** 1.0.0
