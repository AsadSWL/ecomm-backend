const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: {
    street: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String }
  },
  paymentIntegration: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration' },
  deliveryAreas: [String],
  holidays: { type: mongoose.Schema.Types.ObjectId, ref: 'Holiday' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplier', supplierSchema);
