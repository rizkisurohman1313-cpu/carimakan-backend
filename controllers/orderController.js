import db, { nextId } from '../database/db.js';

export const createOrder = (req, res) => {
  try {
    const { meals, totalAmount, shippingAddress, notes } = req.body;

    if (!meals || meals.length === 0) {
      return res.status(400).json({ error: 'Minimal satu meal harus dipilih' });
    }

    const orderId = nextId(db.data._meta, 'lastOrderId');
    const now = new Date().toISOString();

    const newOrder = {
      id: orderId,
      user_id: req.userId,
      meals,
      total_amount: totalAmount,
      status: 'pending',
      payment_method: null,
      payment_status: 'pending',
      shipping_address: shippingAddress,
      notes,
      created_at: now,
      updated_at: now,
    };

    db.data.orders.push(newOrder);
    db.write();

    res.status(201).json({ message: 'Order berhasil dibuat', order: newOrder });
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ error: 'Gagal membuat order' });
  }
};

export const getOrders = (req, res) => {
  try {
    const orders = db.data.orders
      .filter(o => o.user_id === req.userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Gagal ambil orders' });
  }
};

export const getAllOrders = (req, res) => {
  try {
    // Return all orders sorted by date
    const orders = db.data.orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Gagal ambil semua orders' });
  }
};

export const getOrderDetail = (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const order = db.data.orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    if (order.user_id !== req.userId) {
      return res.status(403).json({ error: 'Tidak punya akses ke order ini' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Gagal ambil detail order' });
  }
};

export const updateOrderStatus = (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }

    const orderIndex = db.data.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    db.data.orders[orderIndex].status = status;
    db.data.orders[orderIndex].updated_at = new Date().toISOString();
    db.write();

    res.json({ message: 'Status order berhasil diupdate', order: db.data.orders[orderIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Gagal update status order' });
  }
};

export const cancelOrder = (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const orderIndex = db.data.orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    const order = db.data.orders[orderIndex];

    if (order.user_id !== req.userId) {
      return res.status(403).json({ error: 'Tidak punya akses ke order ini' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Hanya order pending yang bisa dibatalkan' });
    }

    db.data.orders[orderIndex].status = 'cancelled';
    db.data.orders[orderIndex].payment_status = 'failed';
    db.data.orders[orderIndex].updated_at = new Date().toISOString();
    db.write();

    res.json({ message: 'Order berhasil dibatalkan', order: db.data.orders[orderIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Gagal batalkan order' });
  }
};
