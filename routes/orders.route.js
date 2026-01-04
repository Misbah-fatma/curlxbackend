// routes/order.routes.js
import express from 'express';
import Orders from '../models/Payment.js';
import Product from '../models/Product.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * CREATE ORDER
 */
router.post("/checkout", auth, async (req, res) => {
  try {
    const { items, amount, paymentMethod } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });
    console.log("esdwed", req.user)

    const order = await Orders.create({
      userId: req.user,
      items,           // store all cart items
      amount,          // total amount
      paymentMethod,
      status: "PENDING_VERIFICATION",
    });

    res.status(201).json({
      message: "Order created",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Checkout failed" });
  }
});

/**
 * CONFIRM PAYMENT (manual)
 */
router.post("/confirm/:orderId", auth, async (req, res) => {
  try {
    const { transactionRef } = req.body;

    const order = await Orders.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not allowed" });

    order.transactionRef = transactionRef;
    order.paymentStatus = "pending";
    await order.save();

    res.json({ message: "Payment submitted for verification" });
  } catch {
    res.status(500).json({ message: "Failed to confirm payment" });
  }
});

router.get("/allOrders", auth, async (req, res) => {
  try {
    // Fetch all orders, sorted newest first
    const orders = await Orders.find({})
      .populate("userId", "name email") // include user info
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});


export default router;
