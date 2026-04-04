//#region Trade Routes
// Ye routes humare trades ke liye hain. Isme hum trade create, view, aur delete karna seekhenge. 
// Jab bhi koi user trade karega, toh uska data yahan se process hoke database me save hoga, aur user ko confirmation milega. 

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Trade = require("../models/Trade");
// routes/trades.js में सबसे ऊपर
router.get("/test", (req, res) => res.send("Backend is Working!"));

// --- नया ट्रेड सेव करना (POST) ---
router.post("/add", auth, async (req, res) => {
  try {
    const newTrade = new Trade({
      ...req.body,
      userId: req.user.id, // सिर्फ इसी यूजर के लिए सेव होगा
    });
    const trade = await newTrade.save();
    res.json(trade);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- सिर्फ लॉगिन यूजर के ट्रेड दिखाना (GET) ---
router.get("/my-trades", auth, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- ट्रेड डिलीट करना (DELETE) ---
router.delete("/:id", auth, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) return res.status(404).json({ msg: "Trade not found" });

    // सुरक्षा: चेक करें कि क्या यह ट्रेड इसी यूजर का है?
    if (trade.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await trade.deleteOne();
    res.json({ msg: "Trade removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
//#endregion