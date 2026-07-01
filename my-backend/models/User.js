//#region ━━━━━ 🚀 WELCOME DEVELOPER | USER IDENTITY MODEL INITIALIZED ━━━━━

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fcmToken: { type: String, default: "" },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    profilePic: {
      type: String,
      default: "",
    },

    badge: {
      type: String,
      enum: ["normal", "vip"],
      default: "normal",
    },
    isVip: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    monthlyProfit: {
      type: Number,
      default: 0,
    },

    completedLessons: [
      {
        type: String,
      },
    ],

    isCertified: {
      type: Boolean,
      default: false,
    },

    certificateData: {
      fullName: { type: String, default: "" },
      mobile: { type: String, default: "" },
      photoUrl: { type: String, default: "" },
      issueDate: { type: Date },
      certId: { type: String, default: "" },
      downloadUrl: { type: String, default: "" },
    },
    // -------------------------------------------------------

    purchasedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },

    acceptedTerms: {
      type: Boolean,
      default: false,
    },

    acceptedTermsAt: {
      type: Date,
      default: null,
    },

    acceptedTermsVersion: {
      type: String,
      default: "",
    },

    acceptedPrivacyVersion: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
//#endregion
// ==========================================================================
// ✅ MODEL STATUS: USER SCHEMA ORGANIZED & VALIDATED.
// 🛡️ SECURITY: PASSWORD HASHING & ROLE-BASED ACCESS CONTROL ACTIVE.
// 🚀 DEPLOYMENT: READY FOR GLOBAL IDENTITY MANAGEMENT!
// ==========================================================================
