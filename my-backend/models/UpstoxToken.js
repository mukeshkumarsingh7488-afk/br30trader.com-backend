const mongoose = require('mongoose');

const UpstoxTokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UpstoxToken', UpstoxTokenSchema);

