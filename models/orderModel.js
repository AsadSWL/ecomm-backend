const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number},
  deliveryAddress: { type: String },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
