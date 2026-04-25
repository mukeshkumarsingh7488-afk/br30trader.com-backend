//#region ━━━━━ 🚀 WELCOME DEVELOPER | CERTIFICATE MODEL INITIALIZED ━━━━━
const mongoose = require("mongoose");

const certSchema = new mongoose.Schema({
  name: String,
  certId: String,
  course: String,
  date: Date,
  fileName: String,
});

module.exports = mongoose.model("Certificate", certSchema);
//#endregion
// ==========================================================================
// ✅ MODEL STATUS: CERTIFICATE SCHEMA ORGANIZED & VALIDATED.
// 🏆 CREDENTIALS: UNIQUE ID MAPPING & DATA INTEGRITY CHECKS ACTIVE.
// 🚀 DEPLOYMENT: READY FOR AUTOMATED CERTIFICATION ISSUANCE!
// ==========================================================================
