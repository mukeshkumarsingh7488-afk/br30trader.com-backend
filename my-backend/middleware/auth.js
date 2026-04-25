//#region ━━━━━ 🚀 WELCOME DEVELOPER | AUTH SECURITY LAYER INITIALIZED ━━━━━
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.header("Authorization") || req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "test_secret");

    req.user = decoded.user || decoded;

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
//#endregion
// ==========================================================================
// ✅ AUTH STATUS: MIDDLEWARE ORGANIZED, VALIDATED & SECURED.
// 🛡️ PROTECTION: JWT PAYLOAD & SESSION INTEGRITY ACTIVE.
// 🚀 DEPLOYMENT: READY TO GOVERN PROTECTED USER ROUTES!
// ==========================================================================
