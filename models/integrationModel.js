const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  cardPayment: { type: Boolean, default: false },
  integrationDetails: {
    api_url: { type: String },
    api_key: { type: String },
    api_secret: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Integration', integrationSchema);
