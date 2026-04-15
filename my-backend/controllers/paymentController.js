//#region IMPORTS
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Course = require("../models/Course");
const Order = require("../models/Order");
const {
  sendEmail,
  paymentFailAdminTemplate,
  paymentFailUserTemplate,
} = require("../utils/emailHelper");
const Coupon = require("../models/Coupon");
//#endregion

//#region Rozorpay key_id And Key_Secret Process.env file
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
//#endregion

//#region Create Payment Order (Frontend se order create karne ke liye)
// Create payment order
exports.createOrder = async (req, res) => {
  try {
    const { courseId, couponCode } = req.body;
    const course = await Course.findById(courseId);

    if (!course) return res.status(404).json({ msg: "Course nahi mila" });

    let finalPrice = Number(course.price);
    let isApplied = false;

    // 🔥 COUPON VALIDATION LOGIC
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      console.log(`🔍 Checking Coupon in DB: "${cleanCode}"`);

      // 🛡️ FIX: isActive field database mein nahi hai, isliye sirf 'code' se dhoondo
      const validCoupon = await Coupon.findOne({
        code: cleanCode,
      });

      if (validCoupon) {
        // Calculation: Price - (Price * Discount / 100)
        const discountAmount =
          (finalPrice * Number(validCoupon.discount)) / 100;
        finalPrice = finalPrice - discountAmount;
        isApplied = true;
        console.log(
          `✅ Coupon Match! ${validCoupon.discount}% Discount Applied. New Price: ${finalPrice}`,
        );
      } else {
        console.log(`❌ Coupon "${cleanCode}" not found in DB.`);
      }
    }

    const options = {
      amount: Math.round(finalPrice * 100), // Razorpay Paisa format
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      order,
      finalPrice,
      discountApplied: isApplied,
      msg: isApplied ? "Coupon Applied!" : "Invalid or No Coupon",
    });
  } catch (err) {
    console.error("❌ RAZORPAY ERROR:", err.message);
    res.status(500).json({ msg: "Order Error", error: err.message });
  }
};
//#endregion

// #region Payment Verify (Frontend se payment verify karne ke liye)
// pement verify
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      amount, // 🔥 Naya: Frontend se total amount (paisa format)
      couponCode, // 🔥 Naya: Agar koi coupon use hua ho
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const user = await User.findById(req.user.id);

      // 1. Course Unlock & Auto-VIP Logic
      if (!user.purchasedCourses.includes(courseId)) {
        user.purchasedCourses.push(courseId);

        // ✨ AUTO-VIP: Course kharidte hi user VIP ban jaye
        user.isVip = true;
        user.badge = "vip";

        await user.save();
      }

      // 💰 2. SALES TRACKER: Kamayi ka hisab database mein save karo
      const newOrder = new Order({
        user: req.user.id,
        course: courseId,
        amount: amount / 100, // Razorpay se 840000 aayega, hum 8400 save karenge
        paymentId: razorpay_payment_id,
        couponUsed: couponCode || "NONE",
      });
      await newOrder.save();

      res.json({
        success: true,
        msg: "Payment Successful! Course & VIP Unlocked.",
        orderId: newOrder._id,
      });
    } else {
      res.status(400).json({ msg: "Invalid Signature!" });
    }
  } catch (err) {
    console.error("❌ Verify Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
//#endregion

// #region Payment Failure Alert Logic (Support Team & User ko alert bhejne ke liye)
// 🔥 NAYA SYSTEM: Payment Failure Alert Logic
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
      subject: `Payment Issue - ${course.title}`,
      html: paymentFailUserTemplate(user, course, reason),
    });

    res.status(200).json({
      success: true,
      msg: "Failure emails sent successfully ✅",
    });
  } catch (err) {
    console.error("❌ PAYMENT FAIL ERROR:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

//#endregion
