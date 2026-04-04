//#region Notification Routes
// Ye routes humare notifications ke liye hain. Isme hum notification create, view, aur clear karna seekhenge. 
// Jab bhi koi important event hoga (jaise course purchase, certificate generate, etc.), toh uska notification yahan se create hoke database me save hoga, aur user ko real-time me alert milega. 
// User ke paas option hoga ki wo apne notifications ko clear kar sake, jisse wo sirf apne liye relevant notifications hi dekhe.
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Notification = require("../models/Notification");

// --- 1. Naya Notification Post Karna ---
router.post("/add", async (req, res) => {
  try {
    const { message } = req.body; // Frontend se sirf message aayega

    if (!message) {
      return res.status(400).json({ msg: "Message is required" });
    }

    // Naya notification object banana
    const newNotif = new Notification({
      message: message,
      senderName: "Admin Mukesh Raj", // Aapka naam yahan fix kar diya hai
    });

    // Database mein save karna
    const savedNotif = await newNotif.save();

    // --- SOCKET.IO REAL-TIME LOGIC ---
    // Jab naya alert save ho jaye, toh turant sabhi connected users ko bhej do
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

// --- Saare notifications delete karne ke liye ---
// --- 1. SIRF WO DIKHAO JO USER NE CLEAR NAHI KIYE ---
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

// --- 2. USER KE LIYE CLEAR KARO (DATABASE SAAF NAHI HOGA) ---
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