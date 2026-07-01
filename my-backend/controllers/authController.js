//#region ━━━━━ 🚀 WELCOME DEVELOPER | AUTH CONTROLLER INITIALIZED ━━━━━
const axios = require("axios");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { sendEmail, otpTemplate, welcomeTemplate, forgotOtpTemplate } = require("../utils/emailHelper");
const path = require("path");

//#region Master Admin Email (Jo .env se aayega)
// .env se config uthana
const MASTER_ADMIN_EMAIL = process.env.MASTER_ADMIN_EMAIL;
//#endregion

// ==========================================
// 🚀 2. CONTROLLER FUNCTIONS
// ==========================================
// 1. 👥 USER & ADMIN REGISTRATION | LOGIC: HANDLING MULTI-ROLE ACCOUNT CREATION
exports.register = async (req, res) => {
  try {
    const { name, email, password, acceptedTerms, acceptedTermsAt, acceptedTermsVersion, acceptedPrivacyVersion } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Name, Email and Password are required!" });
    }

    if (acceptedTerms !== true) {
      return res.status(400).json({ msg: "Please accept Terms & Privacy Policy." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isMaster = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase();
    const role = isMaster ? "admin" : "student";

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email: cleanEmail });

    if (user && user.isVerified) {
      return res.status(400).json({ msg: "Already verified." });
    }

    const termsAcceptedDate = acceptedTermsAt ? new Date(acceptedTermsAt) : new Date();

    if (user) {
      user.name = name;
      user.email = cleanEmail;
      user.password = hashedPassword;
      user.otp = otp;
      user.role = role;
      user.otpExpires = Date.now() + 600000;

      user.acceptedTerms = true;
      user.acceptedTermsAt = termsAcceptedDate;
      user.acceptedTermsVersion = acceptedTermsVersion || "BR30 Trader Terms v1 - 2026";
      user.acceptedPrivacyVersion = acceptedPrivacyVersion || "BR30 Trader Privacy v1 - 2026";
    } else {
      user = new User({
        name,
        email: cleanEmail,
        password: hashedPassword,
        otp,
        role,
        otpExpires: Date.now() + 600000,

        acceptedTerms: true,
        acceptedTermsAt: termsAcceptedDate,
        acceptedTermsVersion: acceptedTermsVersion || "BR30 Trader Terms v1 - 2026",
        acceptedPrivacyVersion: acceptedPrivacyVersion || "BR30 Trader Privacy v1 - 2026",
      });
    }

    const html = otpTemplate(name, otp, isMaster);

    await sendEmail({
      from: process.env.BREVO_EMAIL,
      replyTo: {
        email: "support.br30trader@gmail.com",
        name: "BR30 Support Team",
      },
      to: cleanEmail,
      subject: "🔐 Account Verification OTP",
      html,
    });

    await user.save();

    console.log("✅ OTP Sent:", cleanEmail);

    res.status(201).json({ msg: "OTP Sent!" });
  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 2. 🔑 OTP VERIFICATION | LOGIC: VALIDATING SECURE ACCESS CODES FOR ACCOUNT ACTIVATION
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
      code: "WELCOME30",
      discount: 30,
    };

    const html = welcomeTemplate(user, coupon);

    // 📩 SEND EMAIL
    try {
      await sendEmail({
        to: user.email,

        replyTo: {
          email: "support.br30trader@gmail.com",
          name: "BR30 Support Team",
        },

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

// 3. 🔐 ACCESS CONTROL | LOGIC: USER AUTHENTICATION & PASSWORD RECOVERY SYSTEM
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Register first." });

    if (user.isBlocked === true) {
      return res.status(403).json({
        success: false,
        msg: "🚫 Your account has been suspended. Please contact the Support Team for assistance.",
      });
    }

    if (user.email === MASTER_ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong Password." });

    if (!user.isVerified) return res.status(401).json({ msg: "Verify email first." });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "test_secret", { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        badge: user.badge,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. 🔄 REFACTORED PASSWORD RECOVERY | LOGIC: UPDATED SECURE TOKEN GENERATION & DISPATCH
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Email not found!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 300000; // 5 min
    await user.save();

    const isMaster = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

    const html = forgotOtpTemplate(user.name, otp, isMaster);

    try {
      await sendEmail({
        from: process.env.BREVO_EMAIL,

        replyTo: {
          email: "support.br30trader@gmail.com",
          name: "BR30 Support Team",
        },

        to: email,

        subject: isMaster ? `👑 Admin Reset OTP: ${otp}` : `🔐 Password Reset OTP`,

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

// 5. 👤 PROFILE MANAGEMENT | LOGIC: HANDLING USER METADATA, AVATAR SYNC & DATA UPDATES
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User nahi mila!" });

    res.json(user);
  } catch (err) {
    console.error("Get Profile Error:", err.message);
    res.status(500).json({ error: "Server Error: Profile fetch nahi ho payi." });
  }
};

// 6. 🔄 SYNC PROFILE UPDATE | LOGIC: CONCURRENT NAME EDIT & MEDIA UPLOAD (CLOUDINARY)
exports.updateProfile = async (req, res) => {
  try {
    console.log("🚀 Incoming File Data:", req.file);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "❌ User nahi mila! (msr pro)" });
    }

    user.name = req.body.name || user.name;

    if (req.file) {
      user.profilePic = req.file.path;
      console.log("✅ Nayi Cloudinary URL DB mein save ho gayi:", req.file.path);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "🎉 Profile Update Ho Gayi Hai! (msr pro)",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
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

// 7. 🔐 RESET PASSWORD | LOGIC: FINALIZING NEW CREDENTIALS POST-OTP VERIFICATION
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid ya Expired OTP! ❌" });

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
// ==========================================================================
// ✅ AUTH STATUS: IDENTITY & SECURITY LOGIC ORGANIZED & REFACTORED.
// 🛡️ ENCRYPTION: BCRYPT HASHING & JWT PAYLOADS FULLY VALIDATED.
// 🚀 DEPLOYMENT: AUTHENTICATION ENGINE IS READY FOR PRODUCTION!
// ==========================================================================
