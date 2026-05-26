//#region ━━━━━ 🚀 WELCOME DEVELOPER | PAYMENT SYSTEM INITIALIZED ━━━━━
const axios = require("axios");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Course = require("../models/Course");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { sendEmail, paymentFailAdminTemplate, paymentFailUserTemplate } = require("../utils/emailHelper");

//#region Rozorpay key_id And Key_Secret Process.env file
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
//#endregion

// 1. 💳 INITIATE PAYMENT ORDER | LOGIC: ULTRA PRO RAZORPAY INTEGRATION & SECURE ORDER ID
exports.createOrder = async (req, res) => {
  try {
    const { courseId, couponCode } = req.body;
    console.log(`🚀 Creating order for: ${courseId} with Coupon: ${couponCode || "None"}`);

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, msg: "Course nahi mila" });

    let finalPrice = Number(course.price);
    let isApplied = false;
    let discountInfo = 0;

    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const validCoupon = await Coupon.findOne({ code: cleanCode });

      if (validCoupon) {
        const isExpired = validCoupon.expiryDate && new Date() > new Date(validCoupon.expiryDate);

        if (!isExpired) {
          const discountPercent = Number(validCoupon.discount);
          const discountAmount = (finalPrice * discountPercent) / 100;
          finalPrice = finalPrice - discountAmount;

          isApplied = true;
          discountInfo = discountPercent;
          console.log(`✅ Coupon Match: -${discountPercent}% Applied!`);
        }
      }
    }

    const options = {
      amount: Math.round(finalPrice * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { courseId, couponCode: isApplied ? couponCode : "NONE" },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: order,
      key: process.env.RAZORPAY_KEY_ID,
      finalPrice: finalPrice,
      discountApplied: isApplied,
      msg: isApplied ? `Success! ₹${finalPrice} ka payment hai.` : "Order Created",
    });
  } catch (err) {
    console.error("❌ RAZORPAY ERROR:", err);
    res.status(500).json({ success: false, msg: "Order Error", error: err.message });
  }
};

// 2. 🛡️ VERIFY PAYMENT SIGNATURE | LOGIC: HMAC SHA256 VALIDATION FOR TRANSACTION INTEGRITY
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, amount, couponCode } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign.toString()).digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, msg: "Fraud Detected! Invalid Signature." });
    }

    const existingOrder = await Order.findOne({
      paymentId: razorpay_payment_id,
    });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        msg: "Payment already processed! Don't try to hack.",
      });
    }

    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    if (paymentDetails.status !== "captured") {
      return res.status(400).json({ success: false, msg: "Payment not captured yet!" });
    }

    const user = await User.findById(req.user.id);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ success: false, msg: "User or Course not found" });
    }

    if (!user.purchasedCourses.includes(courseId)) {
      user.purchasedCourses.push(courseId);
      user.isVip = true;
      user.badge = "vip";
    }

    const newOrder = new Order({
      user: req.user.id,
      course: courseId,
      productName: course.title,
      amount: paymentDetails.amount / 100,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      couponUsed: couponCode || "NONE",
      status: "SUCCESS",
    });

    await Promise.all([user.save(), newOrder.save()]);

    console.log(`✅ Verified: User ${user.email} unlocked ${course.title}`);

    res.status(200).json({
      success: true,
      msg: "Payment Verified! Course & VIP Unlocked. 🚀",
      orderId: newOrder._id,
    });
  } catch (err) {
    console.error("❌ Ultra Pro Verify Error:", err.message);
    res.status(500).json({
      success: false,
      msg: "Verification Failed",
      error: err.message,
    });
  }
};

// 3. 🚨 PAYMENT FAILURE DISPATCHER | LOGIC: REAL-TIME ALERTS FOR SUPPORT & USER ASSISTANCE
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { courseId, reason } = req.body;

    const user = await User.findById(req.user.id);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ msg: "User ya Course nahi mila" });
    }

    console.log("User:", user.name, user.email);
    console.log("Course:", course.title);

    // 🔥 1. ADMIN ALERT MAIL
    await sendEmail({
      to: process.env.SUPPORT_EMAIL_USER,
      subject: `⚠️ Payment Failed: ${user.name}`,
      html: paymentFailAdminTemplate(user, course, reason),
    });

    // 🔥 2. USER HELP MAIL
    await sendEmail({
      to: user.email,
      subject: `⚠️ Payment Failed - ${course.title}`,
      html: paymentFailUserTemplate(user, course, reason),
    });

    res.status(200).json({
      success: true,
      msg: "Failure emails sent successfully ✅",
    });
  } catch (err) {
    console.error("❌ PAYMENT FAIL ERROR:", err);

    res.status(500).json({
      msg: "Server Error",
      error: err.message,
    });
  }
};
//#endregion
// ==========================================================================
// ✅ PAYMENT STATUS: FINANCIAL & TRANSACTIONAL LOGIC FULLY REFACTORED.
// 🛡️ SECURITY: RAZORPAY SIGNATURES & HMAC VALIDATIONS ACTIVE.
// 🚀 DEPLOYMENT: PAYMENT ENGINE IS READY FOR HIGH-VOLUME TRAFFIC!
// ==========================================================================
