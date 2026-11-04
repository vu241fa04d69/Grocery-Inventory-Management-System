const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: {
    type: String,
    required: true,
    enum: ["Fruits & Vegetables", "Dairy", "Bakery", "Beverages", "Snacks", "Staples", "Household", "Other"]
  },
  sku: { type: String, required: true, trim: true, uppercase: true, unique: true, maxlength: 40 },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  reorderLevel: { type: Number, required: true, min: 0, default: 5 },
  supplier: { type: String, trim: true, default: "", maxlength: 120 }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
