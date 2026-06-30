import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mealRoutes from './routes/meals.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import { setSocketServer } from './socket.js';
import db from './database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

setSocketServer(io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', mealRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'Backend server is running',
    database: db.open ? 'connected' : 'disconnected',
    engine: 'SQLite (better-sqlite3)',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🍴 Backend server running on port ${PORT}`);
  console.log(`📡 Endpoints: http://localhost:${PORT}`);
  console.log(`🗄️  Database: SQLite (better-sqlite3)`);
});
