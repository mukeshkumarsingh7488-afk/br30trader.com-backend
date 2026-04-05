const mongoose = require('mongoose');

const UpstoxTokenSchema = new mongoose.Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Date, required: true }, // Token expiry date
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UpstoxToken', UpstoxTokenSchema);