//#region ━━━━━ 🚀 WELCOME DEVELOPER | USER SYSTEM INITIALIZED ━━━━━
const axios = require("axios");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const { sendEmail, offerTemplate, vipTemplate } = require("../utils/emailHelper");

// 1. 📊 FETCH USER STATISTICS | LOGIC: AGGREGATING TOTAL USERS, VIP MEMBERS & ACCOUNT STATUS
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const vipCount = await User.countDocuments({
      badge: { $regex: /^vip$/i },
    });
    const normalCount = totalUsers - vipCount;

    res.status(200).json({
      success: true,
      totalUsers,
      vipCount,
      normalCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. 📧 BULK COUPON MARKETING | LOGIC: GENERATING PROMO CODES WITH AUTOMATED 7-DAY EXPIRY
exports.sendMarketingMail = async (req, res) => {
  try {
    const { subject, htmlContent, target } = req.body;

    if (!subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: "Subject aur message required hai!",
      });
    }

    const discountMatch = subject.match(/(\d+)%/);
    const discountValue = discountMatch ? discountMatch[1] : "30";
    const dynamicCoupon = `OFFER${discountValue}`;

    await Coupon.findOneAndUpdate(
      { code: dynamicCoupon.toUpperCase() },
      {
        code: dynamicCoupon.toUpperCase(),
        discount: parseInt(discountValue),
        isActive: true,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    let filter = {};
    let finalHtml = "";

    if (target === "vip") {
      filter = { $or: [{ badge: { $regex: /^vip$/i } }, { isVip: true }] };
      finalHtml = vipTemplate({ discountValue, dynamicCoupon, htmlContent });
    } else if (target === "normal") {
      filter = {
        $and: [{ $or: [{ badge: { $exists: false } }, { badge: { $not: /^vip$/i } }] }, { $or: [{ isVip: false }, { isVip: { $exists: false } }] }],
      };
      finalHtml = offerTemplate({ discountValue, dynamicCoupon, htmlContent });
    } else {
      filter = {};
      finalHtml = offerTemplate({ discountValue, dynamicCoupon, htmlContent });
    }

    const targetUsers = await User.find(filter).select("email name");

    if (!targetUsers.length) {
      return res.status(404).json({
        success: false,
        message: "Koi target user nahi mila!",
      });
    }

    const emailList = targetUsers.map((u) => u.email?.trim()).filter((email) => email && email.includes("@"));

    console.log("TARGET USERS:", targetUsers);
    console.log("EMAIL LIST:", emailList);

    if (!emailList.length) {
      return res.status(404).json({
        success: false,
        message: "Target users ke paas valid email nahi mila!",
      });
    }

    await sendEmail({
      from: "BR30 Trader <support.br30trader@gmail.com>",
      to: process.env.BREVO_EMAIL,
      bcc: emailList,
      replyTo: "support.br30trader@gmail.com",
      subject: subject || (target === "vip" ? "💎 VIP Special Update" : "🔥 Special Discount for You"),
      html: finalHtml,
    });

    return res.status(200).json({
      success: true,
      message: `${emailList.length} users ko email successfully bhej diya!`,
    });
  } catch (error) {
    console.error("❌ SEND MARKETING MAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || "Marketing mail send failed!",
    });
  }
};
//#endregion
// ==========================================================================
// ✅ USER STATUS: IDENTITY & PROFILE MANAGEMENT LOGIC FULLY REFACTORED.
// 📧 MARKETING: AUTOMATED COUPON ENGINE & EMAIL SYSTEMS OPERATIONAL.
// 🚀 DEPLOYMENT: USER CONTROLLER IS READY FOR PRODUCTION ECOSYSTEM!
// ==========================================================================
