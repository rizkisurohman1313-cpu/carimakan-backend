import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import db, { nextId } from '../database/db.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key';
const getJwtExpiry = () => process.env.JWT_EXPIRY || '7d';

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedName = name?.trim();

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ error: 'Lengkapi semua field' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password tidak cocok' });
    }

    // Cek email sudah terdaftar
    const existingUser = db.data.users.find(u => u.email === normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Buat user baru
    const userId = nextId(db.data._meta, 'lastUserId');
    const newUser = {
      id: userId,
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: null,
      address: null,
      role: role || 'customer',
      created_at: new Date().toISOString(),
    };

    db.data.users.push(newUser);
    db.write();

    const token = jwt.sign({ userId, email: normalizedEmail }, getJwtSecret(), {
      expiresIn: getJwtExpiry(),
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: { id: userId, name: normalizedName, email: normalizedEmail },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: 'Gagal registrasi' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email dan password diperlukan' });
    }

    const user = db.data.users.find(u => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), {
      expiresIn: getJwtExpiry(),
    });
    
    console.log('Login successful - Token created:', {
      userId: user.id,
      email: user.email,
      jwtSecret: getJwtSecret() ? 'Set' : 'Not set',
      expiresIn: getJwtExpiry(),
      tokenPreview: token.substring(0, 20) + '...'
    });

    res.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Gagal login' });
  }
};

export const getProfile = (req, res) => {
  try {
    const user = db.data.users.find(u => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Gagal ambil profil' });
  }
};

export const updateProfile = (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userIndex = db.data.users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    db.data.users[userIndex] = { ...db.data.users[userIndex], name, phone, address };
    db.write();

    const { password, ...userWithoutPassword } = db.data.users[userIndex];
    res.json({ message: 'Profil berhasil diupdate', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Gagal update profil' });
  }
};

export const addFavorite = (req, res) => {
  try {
    const { mealId, mealName, mealImage } = req.body;

    const exists = db.data.favorites.find(
      f => f.user_id === req.userId && f.meal_id === mealId
    );
    if (exists) {
      return res.status(400).json({ error: 'Sudah ada di favorit' });
    }

    const favId = nextId(db.data._meta, 'lastFavoriteId');
    db.data.favorites.push({
      id: favId,
      user_id: req.userId,
      meal_id: mealId,
      meal_name: mealName,
      meal_image: mealImage,
    });
    db.write();

    const favorites = db.data.favorites
      .filter(f => f.user_id === req.userId)
      .map(f => ({ mealId: f.meal_id, mealName: f.meal_name, mealImage: f.meal_image }));

    res.json({ message: 'Ditambahkan ke favorit', favorites });
  } catch (error) {
    res.status(500).json({ error: 'Gagal tambah favorit' });
  }
};

export const removeFavorite = (req, res) => {
  try {
    const { mealId } = req.body;

    db.data.favorites = db.data.favorites.filter(
      f => !(f.user_id === req.userId && f.meal_id === mealId)
    );
    db.write();

    const favorites = db.data.favorites
      .filter(f => f.user_id === req.userId)
      .map(f => ({ mealId: f.meal_id, mealName: f.meal_name, mealImage: f.meal_image }));

    res.json({ message: 'Dihapus dari favorit', favorites });
  } catch (error) {
    res.status(500).json({ error: 'Gagal hapus favorit' });
  }
};

export const getFavorites = (req, res) => {
  try {
    const favorites = db.data.favorites
      .filter(f => f.user_id === req.userId)
      .map(f => ({ mealId: f.meal_id, mealName: f.meal_name, mealImage: f.meal_image }));

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Gagal ambil favorit' });
  }
};
