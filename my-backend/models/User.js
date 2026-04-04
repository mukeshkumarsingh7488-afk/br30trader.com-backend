//#region User Model
// Ye model humare users ke liye hai. Isme hum user ka naam, email, password, aur other details store karenge. 
// Jab bhi koi user register hoga, toh iska record yahan save ho jayega, taki hum future me usko access kar sakein.

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

    // --- NEW FIELDS FOR VIP SYSTEM ---
    badge: {
      type: String,
      enum: ["normal", "vip"],
      default: "normal",
    },
    isVip: {
      type: Boolean,
      default: false,
    },

    // 🔥 Block field :
    isBlocked: {
      type: Boolean,
      default: false,
    },

    monthlyProfit: {
      type: Number,
      default: 0,
    }, // Leaderboard ranking ke liye

    // 🎓 --- NEW: AUTOMATIC CERTIFICATE & PROGRESS SYSTEM ---
    completedLessons: [
      {
        type: String, // Yahan un videos/lessons ki ID save hogi jo user dekh chuka hai
      },
    ],

    isCertified: {
      type: Boolean,
      default: false, // Jab 100% video dekh lega tabhi 'true' hoga
    },

    certificateData: {
      fullName: { type: String, default: "" },
      mobile: { type: String, default: "" },
      photoUrl: { type: String, default: "" }, // Certificate par student ki photo ke liye
      issueDate: { type: Date },
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
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
//#endregion