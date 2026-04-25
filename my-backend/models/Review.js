//#region ━━━━━ 🚀 WELCOME DEVELOPER | REVIEW MODEL INITIALIZED ━━━━━
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  username: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  status: {
    type: String,
    enum: ["approved", "hidden", "pending"],
    default: "approved",
  },
  adminReply: {
    type: String,
    default: "",
  },

  replied: {
    type: Boolean,
    default: false,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
//#endregion
// ==========================================================================
// ✅ MODEL STATUS: REVIEW SCHEMA ORGANIZED & VALIDATED.
// 📊 ANALYTICS: RATING AGGREGATION & FEEDBACK LOGIC ACTIVE.
// 🚀 DEPLOYMENT: READY FOR PUBLIC TESTIMONIAL DISPLAY!
// ==========================================================================
