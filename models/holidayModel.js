const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  holidays: [Date],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Holiday', holidaySchema);
