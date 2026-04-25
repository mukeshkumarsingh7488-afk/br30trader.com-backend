//#region ━━━━━ 🚀 WELCOME DEVELOPER | WHATSAPP SYSTEM INITIALIZED ━━━━━
/**
 * 📲 WHATSAPP SUPPORT UTILITY
 * Logic: Generates dynamic support links for failed payment assistance
 * Status: Future Feature | Refactored & Ready for Integration
 * 📅 Updated: 25 April 2026
 */

const express = require("express");
const router = express.Router();

// 🔥 WhatsApp Link Generator Route
router.post("/whatsapp-link", (req, res) => {
  const { name, email, course } = req.body;

  const number = process.env.WHATSAPP_NUMBER;

  if (!number) {
    return res.status(500).json({
      success: false,
      msg: "WhatsApp number not configured",
    });
  }

  const message = `Hi BR30 Team, mera payment fail ho gaya hai.

Name: ${name}
Email: ${email}
Course: ${course}

Please help me retry.`;

  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  res.json({ success: true, url });
});
module.exports = router;
//#endregion
// ==========================================================================
// ✅ SUPPORT STATUS: WHATSAPP LINK LOGIC ORGANIZED & TESTED.
// 🚀 DEPLOYMENT: READY FOR PRODUCTION (FUTURE FEATURE READY)!
// ==========================================================================
