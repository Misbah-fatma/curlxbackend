// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: Number,

    paymentMethod: {
      type: String,
      enum: ["zelle", "venmo", "cashapp", "crypto"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
    },
    paymentId: {
      type: String,
      required: true,
    },
    transactionRef: String, // tx hash / note / screenshot name
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
