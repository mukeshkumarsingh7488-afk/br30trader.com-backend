//#region IMPORTS & CONFIG
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const {
  otpTemplate,
  welcomeTemplate,
  forgotOtpTemplate,
} = require("../utils/emailHelper");
const path = require("path");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

//#endregion

//#region Master Admin Email (Jo .env se aayega)
// .env se config uthana
const MASTER_ADMIN_EMAIL = process.env.MASTER_ADMIN_EMAIL;
//#endregion

// ==========================================
// 🚀 2. CONTROLLER FUNCTIONS
// ==========================================
//#region user&admin register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Email/Pass missing!" });

    const isMaster = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
    const role = isMaster ? "admin" : "student";

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });

    if (user && user.isVerified)
      return res.status(400).json({ msg: "Already verified." });

    if (user) {
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.role = role;
      user.otpExpires = Date.now() + 600000;
    } else {
      user = new User({
        name,
        email,
        password: hashedPassword,
        otp,
        role,
        otpExpires: Date.now() + 600000,
      });
    }

    // 🔥 TEMPLATE CALL
    const html = otpTemplate(name, otp, isMaster);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `🔐 OTP: ${otp}`,
      html: html,
    });

    await user.save();

    console.log("✅ OTP Sent:", email);

    res.status(201).json({ msg: "OTP Sent!" });
  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid/Expired OTP!" });

    // ✅ verify
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 🔥 TEMPLATE CALL
    const coupon = {
      code: "WELCOME10",
      discount: 10,
    };

    const html = welcomeTemplate(user, coupon);

    // 📩 SEND EMAIL
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Welcome to the Family! 🚀",
        html: html,
      });

      console.log("✅ Welcome Email Sent");
    } catch (e) {
      console.log("❌ Mail error:", e.message);
    }

    res.json({ msg: "Account verified! ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//#endregion

//#region User Login & Forgot Password Functions
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. User ko database mein dhoondo
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Register first." });

    // 🔥 2. Sabse Pehle BLOCK CHECK Karo (Password se bhi pehle)
    if (user.isBlocked === true) {
      return res.status(403).json({
        success: false,
        msg: "🚫 Your account has been suspended. Please contact the Support Team for assistance.",
      });
    }

    // 3. Admin Auto-Role Logic (Jo pehle se tha)
    if (user.email === MASTER_ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    // 4. Password Match Check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong Password." });

    // 5. Email Verification Check
    if (!user.isVerified)
      return res.status(401).json({ msg: "Verify email first." });

    // 6. Token Generate Karo
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "test_secret",
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 2. UPDATED FORGOT PASSWORD FUNCTION ---
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. User check
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Email not found!" });

    // 2. OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 300000; // 5 min
    await user.save();

    // 3. Admin check
    const isMaster = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

    // 4. 🔥 Helper call (IMPORTANT CHANGE)
    const html = forgotOtpTemplate(user.name, otp, isMaster);

    // 5. Send mail
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: isMaster
          ? `👑 Admin Reset OTP: ${otp}`
          : `🔐 Password Reset OTP`,
        html: html,
      });

      console.log("✅ Reset OTP Email Sent");
      res.json({ msg: "Reset OTP sent successfully!" });
    } catch (sendError) {
      console.error("❌ Resend Error:", sendError);
      return res.status(500).json({ error: "Email send failed!" });
    }
  } catch (err) {
    console.error("🔥 Forgot Error:", err);
    res.status(500).json({ error: err.message });
  }
};

//#endregion

//#region PROFILE MANAGEMENT FUNCTIONS
// ==========================================
// 🚀 PROFILE MANAGEMENT FUNCTIONS
// ==========================================

// 1. GET PROFILE (Profile Data Fetch Karne ke Liye)
exports.getProfile = async (req, res) => {
  try {
    // req.user.id auth middleware se aa rahi hai
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User nahi mila!" });

    res.json(user);
  } catch (err) {
    console.error("Get Profile Error:", err.message);
    res
      .status(500)
      .json({ error: "Server Error: Profile fetch nahi ho payi." });
  }
};

// 2. UPDATE PROFILE (Name Edit aur Photo Upload)
exports.updateProfile = async (req, res) => {
  try {
    console.log("🚀 Incoming File Data:", req.file);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "❌ User nahi mila! (msr pro)" });
    }

    // 1. Name update logic
    user.name = req.body.name || user.name;

    // 2. Agar Cloudinary par nayi file upload hui hai
    if (req.file) {
      // Cloudinary ka direct URL 'req.file.path' mein hota hai
      user.profilePic = req.file.path;
      console.log(
        "✅ Nayi Cloudinary URL DB mein save ho gayi:",
        req.file.path,
      );
    }

    const updatedUser = await user.save();

    // 3. Frontend ko Success Response bhejo
    res.json({
      success: true,
      message: "🎉 Profile Update Ho Gayi Hai! (msr pro)",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic, // Pura URL jayega frontend ko
      },
    });
  } catch (err) {
    console.error("❌ Update Error (msr pro):", err.message);
    res.status(500).json({
      success: false,
      message: "❌ Server Error: Profile update fail ho gaya (msr pro)",
    });
  }
};

//#endregion

//#region Reset Password Function (OTP Verify ke Baad Naya Password Set Karne ke Liye)
// 3. RESET PASSWORD (Forgot Password ke Baad Naya Password Set Karne ke Liye)
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ msg: "Invalid ya Expired OTP! ❌" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();
    res.json({ msg: "Password successfully change ho gaya! 🔐" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion
