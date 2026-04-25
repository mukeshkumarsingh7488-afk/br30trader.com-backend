//#region ━━━━━ 🚀 WELCOME DEVELOPER | NOTIFICATION MODEL INITIALIZED ━━━━━
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  senderName: { type: String, default: "Admin Mukesh Raj" },
  date: { type: Date, default: Date.now },

  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Notification", NotificationSchema);
//#endregion
// ==========================================================================
// ✅ MODEL STATUS: NOTIFICATION SCHEMA ORGANIZED & VALIDATED.
// 🛡️ VISIBILITY: SOFT-DELETE (DELETEDBY) & PERSISTENCE LOGIC ACTIVE.
// 🚀 DEPLOYMENT: READY FOR REAL-TIME ALERT DISPATCHING!
// ==========================================================================
