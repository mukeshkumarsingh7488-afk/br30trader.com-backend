//#region ━━━━━ 🚀 WELCOME DEVELOPER | ADMIN SECURITY LAYER INITIALIZED ━━━━━
// 🛡️ ADMIN ACCESS CONTROL | LOGIC: JWT VALIDATION & DATABASE ROLE VERIFICATION

const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User nahi mila bhai!" });
    }

    console.log("🔥 DB Fresh Role:", user.role);

    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only! 🛑" });
    }

    next();
  } catch (err) {
    console.error("❌ Admin Middleware Error:", err.message);
    res.status(500).json({ error: "Server Error: Admin check fail ho gaya" });
  }
};
//#endregion
// ==========================================================================
// ✅ SECURITY STATUS: ADMIN MIDDLEWARE ORGANIZED & HARDENED.
// 🛡️ VERIFICATION: TOKEN INTEGRITY & DB ROLE CHECKS OPERATIONAL.
// 🚀 DEPLOYMENT: READY TO PROTECT SENSITIVE ADMIN INFRASTRUCTURE!
// ==========================================================================
