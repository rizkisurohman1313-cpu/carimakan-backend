import db, { nextId } from '../database/db.js';
import Stripe from 'stripe';
import { getSocketServer } from '../socket.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export const createPayment = async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;

    if (!orderId || !amount || !method) {
      return res.status(400).json({ error: 'Lengkapi semua field pembayaran' });
    }

    const order = db.data.orders.find(o => o.id === parseInt(orderId));
    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    if (order.user_id !== req.userId) {
      return res.status(403).json({ error: 'Tidak punya akses ke order ini' });
    }

    const paymentId = nextId(db.data._meta, 'lastPaymentId');
    const newPayment = {
      id: paymentId,
      order_id: parseInt(orderId),
      user_id: req.userId,
      amount,
      currency: 'IDR',
      method,
      transaction_id: null,
      status: 'pending',
      payment_details: null,
      created_at: new Date().toISOString(),
    };

    db.data.payments.push(newPayment);
    db.write();

    // Jika menggunakan Stripe
    if (method === 'stripe') {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: 'usd',
          payment_method_types: ['card'],
          metadata: { orderId: orderId.toString(), paymentId: paymentId.toString() },
        });

        const paymentIndex = db.data.payments.findIndex(p => p.id === paymentId);
        db.data.payments[paymentIndex].payment_details = {
          clientSecret: paymentIntent.client_secret,
          publishableKey: process.env.STRIPE_PUBLIC_KEY,
        };
        db.write();

        return res.status(201).json({
          message: 'Payment intent created',
          payment: db.data.payments[paymentIndex],
          clientSecret: paymentIntent.client_secret,
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return res.status(500).json({ error: 'Gagal create payment intent' });
      }
    }

    res.status(201).json({ message: 'Payment created', payment: newPayment });
  } catch (error) {
    console.error('Create payment error:', error.message);
    res.status(500).json({ error: 'Gagal buat payment' });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const { paymentIntentId } = req.body;

    const paymentIndex = db.data.payments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment tidak ditemukan' });
    }

    const payment = db.data.payments[paymentIndex];

    if (payment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Tidak punya akses ke payment ini' });
    }

    // Jika menggunakan Stripe
    if (payment.method === 'stripe' && paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
          db.data.payments[paymentIndex].status = 'success';
          db.data.payments[paymentIndex].transaction_id = paymentIntentId;

          const orderIndex = db.data.orders.findIndex(o => o.id === payment.order_id);
          if (orderIndex !== -1) {
            db.data.orders[orderIndex].payment_status = 'paid';
            db.data.orders[orderIndex].status = 'processing';
            db.data.orders[orderIndex].updated_at = new Date().toISOString();
          }
          db.write();

          const io = getSocketServer();
          if (io && orderIndex !== -1) {
            io.emit('orderStatusUpdated', {
              orderId: db.data.orders[orderIndex].id,
              status: db.data.orders[orderIndex].status,
              paymentStatus: db.data.orders[orderIndex].payment_status,
            });
          }

          return res.json({
            message: 'Payment berhasil',
            payment: db.data.payments[paymentIndex],
            order: orderIndex !== -1 ? db.data.orders[orderIndex] : null,
          });
        } else {
          db.data.payments[paymentIndex].status = 'failed';
          db.write();
          return res.status(400).json({ error: 'Payment belum berhasil' });
        }
      } catch (stripeError) {
        return res.status(500).json({ error: 'Gagal verifikasi payment' });
      }
    }

    // Untuk metode non-Stripe: langsung confirm
    db.data.payments[paymentIndex].status = 'success';
    const orderIndex = db.data.orders.findIndex(o => o.id === payment.order_id);
    if (orderIndex !== -1) {
      db.data.orders[orderIndex].payment_status = 'paid';
      db.data.orders[orderIndex].status = 'processing';
      db.data.orders[orderIndex].updated_at = new Date().toISOString();
    }
    db.write();

    const io = getSocketServer();
    if (io && orderIndex !== -1) {
      io.emit('orderStatusUpdated', {
        orderId: db.data.orders[orderIndex].id,
        status: db.data.orders[orderIndex].status,
        paymentStatus: db.data.orders[orderIndex].payment_status,
      });
    }

    res.json({
      message: 'Payment confirmed',
      payment: db.data.payments[paymentIndex],
      order: orderIndex !== -1 ? db.data.orders[orderIndex] : null,
    });
  } catch (error) {
    console.error('Confirm payment error:', error.message);
    res.status(500).json({ error: 'Gagal confirm payment' });
  }
};

export const getPaymentHistory = (req, res) => {
  try {
    const payments = db.data.payments
      .filter(p => p.user_id === req.userId)
      .map(p => {
        const order = db.data.orders.find(o => o.id === p.order_id);
        return { ...p, order: order || null };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Gagal ambil payment history' });
  }
};
