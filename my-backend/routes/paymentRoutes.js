//#region Payment Routes
// Ye routes humare payment processing ke liye hain. Isme hum order create karna, payment verify karna, aur payment failure handle karna seekhenge. 
// Jab bhi koi user course purchase karega, toh uska order yahan se create hoke database me save hoga, aur Razorpay ke through payment process hoke user ko confirmation milega. 
// Agar payment successful hota hai, toh uska record yahan se update hoke user ke courses me add ho jayega, aur agar payment fail hota hai, toh uska record yahan se update hoke user ko alert milega.
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // 🔥 Auth ko sabse upar le aaya

// Controllers Import
const { getUserStats } = require("../controllers/userController");
const {
  createOrder,
  verifyPayment,
  handlePaymentFailure,
} = require("../controllers/paymentController");

// --- ROUTES ---

// 1. Dashboard Stats (GET Route)
router.get("/user-stats", auth, getUserStats);

// 2. Create Order Route
router.post("/order", auth, createOrder);

// 3. Verify Success Payment Route
router.post("/verify", auth, verifyPayment);

// 4. Payment Fail Alert Route
router.post("/payment-failed", auth, handlePaymentFailure);

module.exports = router;
//#endregion