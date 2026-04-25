//#region ━━━━━ 🚀 WELCOME DEVELOPER | SYSTEM INITIALIZED ━━━━━
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Notification = require("../models/Notification");

// 1. 🔔 POST NEW NOTIFICATION | LOGIC: CREATING REAL-TIME ALERTS FOR USERS
router.post("/add", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ msg: "Message is required" });
    }

    const newNotif = new Notification({
      message: message,
      senderName: "Admin Mukesh Raj",
    });

    const savedNotif = await newNotif.save();

    // --- SOCKET.IO REAL-TIME LOGIC ---
    const io = req.app.get("socketio");
    if (io) {
      io.emit("new_alert", savedNotif);
      console.log("Real-time alert bhej diya gaya!");
    }

    res.status(201).json(savedNotif);
  } catch (err) {
    console.error("Notif Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// 2. ✅ MARK AS READ / CLEAR | LOGIC: UPDATING NOTIFICATION STATUS TO DISMISSED
router.get("/all", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    // $nin = Not In (Jin notifications mein user ki ID nahi hai, wahi dikhao)
    const notifs = await Notification.find({ deletedBy: { $nin: [userId] } })
      .sort({ date: -1 })
      .limit(10);
    res.json(notifs);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 3. 🧹 CLEAR ALL NOTIFICATIONS | LOGIC: BULK DISMISSING ALL ACTIVE ALERTS FOR USER
router.delete("/clear-all", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Sabhi notifications mein is User ki ID 'deletedBy' mein daal do
    await Notification.updateMany(
      { deletedBy: { $ne: userId } }, // Agar pehle se ID nahi hai
      { $push: { deletedBy: userId } }, // Toh ID push kar do
    );

    res.status(200).json({ msg: "Aapke liye notifications clear ho gaye!" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
//#endregion
// ==========================================================================
// ✅ LIVE STATUS: MARKET ALERT SYSTEM ORGANIZED & REFACTORED.
// 📊 ANALYTICS: REAL-TIME NOTIFICATION DISPATCH READY.
// 🚀 DEPLOYMENT: READY FOR PRODUCTION ENVIRONMENT!
// ==========================================================================
