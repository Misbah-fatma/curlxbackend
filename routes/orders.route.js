// routes/order.routes.js
import express from 'express';
import Orders from '../models/Payment.js';
import { sendOrderEmail } from '../config/sendEmails.js';
import auth from '../middlewares/auth.middleware.js';
import User from "../models/User.js";

const router = express.Router();

/**
 * CREATE ORDER
 */
router.post("/checkout", auth, async (req, res) => {
  try {
    const { items, amount, paymentMethod, paymentId, addressId } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    if (!paymentId)
      return res.status(400).json({ message: "Payment ID is required" });

    // 1️⃣ Fetch user
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // 2️⃣ Select address
    let selectedAddress;

    if (addressId) {
      selectedAddress = user.addresses.id(addressId);
    } else {
      selectedAddress = user.addresses[0]; // fallback
    }

    if (!selectedAddress)
      return res.status(400).json({ message: "Address not found" });

    // 3️⃣ Create order
    const order = await Orders.create({
      userId: user._id,
      items,
      amount,
      paymentMethod,
      paymentId,
      address: selectedAddress,
      status: "PENDING_VERIFICATION",
    });

    // 4️⃣ Send email
    await sendOrderEmail({
      user: {
        name: user.name,
        email: user.email,
      },
      items,
      amount,
      paymentMethod,
      paymentId,
      address: selectedAddress,
    });

    res.status(201).json({
      message: "Order created & email sent",
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
