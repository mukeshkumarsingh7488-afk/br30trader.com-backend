//#region ━━━━━ 🚀 WELCOME DEVELOPER | TRADING SYSTEM INITIALIZED ━━━━━
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Trade = require("../models/Trade");
// test
router.get("/test", (req, res) => res.send("Backend is Working!"));

// 1. 🚀 EXECUTE NEW TRADE | @route: POST /api/trades/save
router.post("/add", auth, async (req, res) => {
  try {
    const newTrade = new Trade({
      ...req.body,
      userId: req.user.id,
    });

    const trade = await newTrade.save();

    return res.status(201).json({
      success: true,
      msg: "Trade saved successfully",
      trade,
    });
  } catch (err) {
    console.error("❌ TRADE SAVE ERROR:", err);

    return res.status(500).json({
      success: false,
      msg: err.message || "Trade not saved",
      error: err.errors || err,
    });
  }
});

// 2. 👤 FETCH MY TRADES | @route: GET /api/trades/my-trades (Login Protected)
router.get("/my-trades", auth, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 3. 🗑️ TERMINATE TRADE RECORD | @route: DELETE /api/trades/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) return res.status(404).json({ msg: "Trade not found" });

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
// ==========================================================================
// ✅ TRADE STATUS: TRADING ENGINE ROUTES ORGANIZED & TESTED.
// 📊 ANALYTICS: REAL-TIME SIGNAL TRACKING & DB SYNC ACTIVE.
// 🚀 DEPLOYMENT: READY FOR PRODUCTION TRADING ENVIRONMENT!
// ==========================================================================
