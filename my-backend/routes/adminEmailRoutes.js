//#region ━━━━━ 🚀 WELCOME DEVELOPER | SYSTEM INITIALIZED ━━━━━
const axios = require("axios");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");
const { sendEmail, getAnnouncementHTML } = require("../utils/emailHelper");

//  📢 OFFICIAL ANNOUNCEMENT EMAIL | LOGIC: DISPATCHING GLOBAL UPDATES TO ALL USERS
router.post("/send-all-email", auth, async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ msg: "Subject aur message required hai!" });
  }

  try {
    const users = await User.find(
      { email: { $exists: true, $ne: "" } },
      "email",
    );

    if (!users.length) {
      return res.status(404).json({ msg: "No users found!" });
    }

    const emailList = users.map((u) => u.email);

    // ✅ TEMPLATE CALL
    const emailTemplate = getAnnouncementHTML(subject, message);

    // ✅ SEND EMAIL (RESEND HIDDEN INSIDE HELPER)
    await sendEmail({
      to: emailList,
      subject: `📢 ${subject}`,
      html: emailTemplate,
    });

    res.status(200).json({
      msg: `${emailList.length} users ko email bhej diya 🚀`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
//#endregion
// ==========================================================================
// ✅ BROADCAST STATUS: ANNOUNCEMENT SYSTEM ORGANIZED & REFACTORED.
// 📢 DISPATCH: GLOBAL COMMUNICATION CHANNELS READY.
// 🚀 DEPLOYMENT: READY FOR PRODUCTION BROADCAST!
// ==========================================================================
