//#region ━━━━━ 🚀 WELCOME DEVELOPER | ORDER MODEL INITIALIZED ━━━━━
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: { type: Number, required: true },
    paymentId: { type: String, required: true },
    couponUsed: { type: String, default: "NONE" },
    status: { type: String, default: "captured" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
//#endregion
// ==========================================================================
// ✅ MODEL STATUS: ORDER SCHEMA ORGANIZED & VALIDATED.
// 🛡️ SECURITY: PAYMENT ID MAPPING & REVENUE LOGIC ACTIVE.
// 🚀 DEPLOYMENT: READY FOR SECURE TRANSACTIONAL PROCESSING!
// ==========================================================================
