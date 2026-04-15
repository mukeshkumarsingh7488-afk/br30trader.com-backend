//#region Imports
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const {
  sendEmail,
  offerTemplate,
  vipTemplate,
} = require("../utils/emailHelper");
//#endregion

//#region GET USER STATS (Admin Panel ke liye user stats dikhane ke liye)
// 1. Stats dikhane ke liye function
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
//#endregion

//#region Professional Email Marketing Coupan Function (With 7-Day Expiry)
// 2. Professional Email Marketing Function (With 7-Day Expiry)
exports.sendMarketingMail = async (req, res) => {
  try {
    const { subject, htmlContent, target } = req.body;

    // --- DISCOUNT LOGIC ---
    const discountMatch = subject.match(/(\d+)%/);
    const discountValue = discountMatch ? discountMatch[1] : "50";
    const dynamicCoupon = `OFFER${discountValue}`;

    // --- SAVE COUPON ---
    await Coupon.findOneAndUpdate(
      { code: dynamicCoupon.toUpperCase() },
      {
        discount: parseInt(discountValue),
        isActive: true,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      { upsert: true, new: true },
    );

    // --- IMPORT TEMPLATES FROM UTILS ---
    const { offerTemplate, vipTemplate } = require("../utils/emailHelper");

    // --- TARGET USERS ---
    let filter = {};
    let finalHtml = "";

    if (target === "vip") {
      filter = { $or: [{ badge: { $regex: /^vip$/i } }, { isVip: true }] };
      finalHtml = vipTemplate({ discountValue, dynamicCoupon, htmlContent });
    } else if (target === "normal") {
      filter = { badge: { $not: { $regex: /^vip$/i } }, isVip: false };
      finalHtml = offerTemplate({ discountValue, dynamicCoupon, htmlContent });
    } else {
      finalHtml = offerTemplate({ discountValue, dynamicCoupon, htmlContent });
    }

    const targetUsers = await User.find(filter).select("email");

    if (!targetUsers.length) {
      return res.status(404).json({
        success: false,
        message: "Koi user nahi mila!",
      });
    }

    const emailList = targetUsers.map((u) => u.email);

    // --- SEND EMAIL (RESEND ONLY) ---
    await sendEmail({
      from: "onboarding@resend.dev",
      bcc: emailList,
      subject:
        subject ||
        (target === "vip"
          ? "💎 VIP Special Update"
          : "🔥 Special Discount for You"),
      html: finalHtml,
    });

    res.status(200).json({
      success: true,
      message: `${emailList.length} users ko email bhej diya!`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
//#endregion
