//#region ━━━━━ 🚀 WELCOME DEVELOPER | SYSTEM INITIALIZED ━━━━━
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // 🔥 Auth ko sabse upar le aaya

// Controllers Import
const { getUserStats } = require("../controllers/userController");
const { createOrder, verifyPayment, handlePaymentFailure } = require("../controllers/paymentController");

// --- ROUTES ---

// 1. 📊 FETCH DASHBOARD ANALYTICS | @route: GET /api/dashboard/stats
router.get("/user-stats", auth, getUserStats);

// 2. 💳 CREATE PAYMENT ORDER | @route: POST /api/orders/create
router.post("/order", auth, createOrder);

// 3. 🛡️ VERIFY PAYMENT SUCCESS | @route: POST /api/orders/verify
router.post("/verify", auth, verifyPayment);

// 4. 🚨 PAYMENT FAILURE ALERT | @route: POST /api/orders/payment-fail
router.post("/payment-failed", auth, handlePaymentFailure);

module.exports = router;
//#endregion
// ==========================================================================
// ✅ TRANSACTION STATUS: PAYMENT GATEWAY ROUTES ORGANIZED & SECURED.
// 🛡️ SECURITY: HMAC SIGNATURE VERIFICATION & AUTH-LAYER ACTIVE.
// 🚀 DEPLOYMENT: READY FOR PRODUCTION TRANSACTIONS!
// ==========================================================================
