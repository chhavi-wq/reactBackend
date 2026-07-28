const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    products: [
      {
        productId: Number,
        title: String,
        price: Number,
        quantity: Number,
        thumbnail: String,
      },
    ],

    totalAmount: Number,

    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);