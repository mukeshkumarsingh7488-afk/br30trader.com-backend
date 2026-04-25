//#region ━━━━━ 🚀 WELCOME DEVELOPER | TRADING ENGINE MODEL INITIALIZED ━━━━━
const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true },
  pnl: { type: Number, required: true },
  note: { type: String },
  brokerage: { type: Number, default: 50 },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trade", tradeSchema);
//#endregion
// ==========================================================================
// ✅ MODEL STATUS: TRADE SCHEMA ORGANIZED & VALIDATED.
// 💰 ANALYTICS: PnL TRACKING, BROKERAGE LOGIC & STATUS FLAGS ACTIVE.
// 🚀 DEPLOYMENT: READY FOR REAL-TIME TRADING JOURNAL SYNC!
// ==========================================================================
