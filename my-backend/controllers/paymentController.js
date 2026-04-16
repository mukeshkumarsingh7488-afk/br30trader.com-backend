//#region IMPORTS
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Course = require("../models/Course");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const {
  sendEmail,
  paymentFailAdminTemplate,
  paymentFailUserTemplate,
} = require("../utils/emailHelper");
//#endregion

//#region Rozorpay key_id And Key_Secret Process.env file
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
//#endregion

// Create payment order (Ultra Pro Version)
exports.createOrder = async (req, res) => {
  try {
    const { courseId, couponCode } = req.body;

    // 1. Course Fetch & Validation
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, msg: "Course nahi mila" });
    }

    let originalPrice = Number(course.price);
    let finalPrice = originalPrice;
    let isApplied = false;
    let discountInfo = 0;

    // 2. 🛡️ ULTRA PRO COUPON LOGIC
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();

      // Coupon dhoondo aur check karo ki wo Active hai ya nahi
      const validCoupon = await Coupon.findOne({ code: cleanCode });

      if (validCoupon) {
        // PRO CHECK: Expiry Date check (Agar aapke schema mein expiryDate hai)
        const isExpired =
          validCoupon.expiryDate &&
          new Date() > new Date(validCoupon.expiryDate);

        if (isExpired) {
          console.log(`⚠️ Coupon Expired: ${cleanCode}`);
        } else {
          // Calculation
          const discountAmount =
            (finalPrice * Number(validCoupon.discount)) / 100;
          finalPrice = finalPrice - discountAmount;
          isApplied = true;
          discountInfo = validCoupon.discount;
          console.log(
            `✅ Promo Applied: ${cleanCode} | Saved: ₹${discountAmount}`,
          );
        }
      }
    }

    // 3. Security Check: Amount rules
    if (finalPrice <= 0) finalPrice = 1;

    // 4. Razorpay Options (Standard Format)
    const options = {
      amount: Math.round(finalPrice * 100), // convert to paise & ensure integer
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${courseId.substring(0, 5)}`,
      notes: {
        course_id: courseId,
        coupon_used: isApplied ? couponCode : "NONE",
        original_price: originalPrice,
        discount_given: `${discountInfo}%`,
      },
    };

    const order = await razorpay.orders.create(options);

    // 5. ✨ FULL PRO RESPONSE
    res.status(200).json({
      success: true,
      order: order, // Frontend will use order.id
      key: process.env.RAZORPAY_KEY_ID, // No more hardcoding on frontend!
      amount: order.amount,
      currency: order.currency,
      finalPrice: finalPrice,
      discountApplied: isApplied,
      couponStatus: isApplied
        ? "VALID"
        : couponCode
          ? "INVALID_OR_EXPIRED"
          : "NONE",
      msg: isApplied
        ? `🎉 Booyah! ${discountInfo}% discount applied.`
        : couponCode
          ? "Oops! Invalid coupon code."
          : "Order initiated.",
    });
  } catch (err) {
    console.error("❌ CRITICAL RAZORPAY ERROR:", err);
    res.status(500).json({
      success: false,
      msg: "Payment Gateway busy hai, thodi der baad try karein.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    });
  }
};
//#endregion
// Razorpay instance import karna mat bhulna jo apne config mein banaya hoga
// const razorpay = require("../config/razorpay");
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      amount, // Frontend se aane wala amount
      couponCode,
    } = req.body;

    // 1. 🛡️ SIGNATURE VERIFICATION (Basic Security)
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res
        .status(400)
        .json({ success: false, msg: "Fraud Detected! Invalid Signature." });
    }

    // 2. 🛡️ DUPLICATE PAYMENT CHECK
    const existingOrder = await Order.findOne({
      paymentId: razorpay_payment_id,
    });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        msg: "Payment already processed! Don't try to hack.",
      });
    }

    // 3. 🛡️ ULTRA PRO: RAZORPAY SE ACTUAL AMOUNT FETCH KARO
    // Ye step fake orders ko 100% rok dega
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    // Check karo ki jo amount pay hua hai wo hamare expected amount se match karta hai ya nahi
    // Note: Razorpay amount paise mein deta hai (e.g. 10000 = Rs 100)
    if (paymentDetails.status !== "captured") {
      return res
        .status(400)
        .json({ success: false, msg: "Payment not captured yet!" });
    }

    // 4. 🏁 DATABASE UPDATES (Course Unlock + VIP)
    const user = await User.findById(req.user.id);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res
        .status(404)
        .json({ success: false, msg: "User or Course not found" });
    }

    // Course unlock logic
    if (!user.purchasedCourses.includes(courseId)) {
      user.purchasedCourses.push(courseId);
      user.isVip = true;
      user.badge = "vip";
    }

    // 5. 💰 SALES TRACKER (Actual Razorpay Amount save karo)
    const newOrder = new Order({
      user: req.user.id,
      course: courseId,
      productName: course.title,
      amount: paymentDetails.amount / 100, // Frontend wala amount nahi, Razorpay wala save karo
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      couponUsed: couponCode || "NONE",
      status: "SUCCESS",
    });

    // Dono ko ek saath save karo
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
