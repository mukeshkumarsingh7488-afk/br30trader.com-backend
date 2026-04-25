//#region ━━━━━ 🚀 WELCOME DEVELOPER | DATABASE SYSTEM INITIALIZED ━━━━━

/**
 * 🗄️ MONGODB ATLAS CONFIGURATION
 * Logic: Establishing secure connection with cloud database clusters
 * Status: Refactored & Production Ready
 */

const mongoose = require("mongoose");

// 🔌 CONNECTION LOGIC: Asynchronous handshake with MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // 💯🚀 SUCCESS: Immediate feedback on stable connection
    console.log("💯🚀 MongoDB Atlas Connected Successfully | Database is Live");
  } catch (err) {
    // ❌ FAILURE: Critical error handling and system exit
    console.error("❌ MongoDB Atlas Connection Failed!", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
//#endregion
// ==========================================================================
// ✅ DB STATUS: MONGODB ARCHITECTURE ORGANIZED & VALIDATED.
// 🚀 DEPLOYMENT: DATABASE ENGINE READY FOR PRODUCTION TRAFFIC!
// ==========================================================================

// 🏁 --- END OF DATABASE CONFIG ---
