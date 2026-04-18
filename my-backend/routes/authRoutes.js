//#region Auth Routes
// Ye routes humare authentication aur user management ke liye hain. Isme hum registration, login, password reset, profile update, aur admin ke liye kuch special routes banayenge.
// Jab bhi koi user register ya login karega, toh uska data yahan se process hoke database me save hoga, aur JWT token generate hoke user ko diya jayega.
// Admin ke liye bhi kuch special routes honge jisse wo users ko block/unblock kar sake, VIP status de sake, aur marketing emails bhej sake.
const express = require("express");
const User = require("../models/User");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");
const { sendVipCertEmail } = require("../utils/emailHelper");
const Certificate = require("../models/Certificate");

const {
  generateProfessionalCert,
} = require("../utils/generateProfessionalCert");

// ==========================================
// 🛡️ MIDDLEWARES
// ==========================================
const upload = require("../middleware/upload");

// ==========================================
// 🎮 CONTROLLERS
// ==========================================
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  verifyOTP,
} = require("../controllers/authController");

const userController = require("../controllers/userController");
const paymentController = require("../controllers/paymentController");

// ==========================================
// 🔓 PUBLIC ROUTES (Sabke liye open hain)
// ==========================================
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ==========================================
// 🏷️ COUPON & DISCOUNT ROUTES (Auto Expiry & Tracking)
// ==========================================

// 1. Latest Active Coupon Load karna (Frontend Countdown ke liye)
// --- ⏳ UPDATED: Latest Coupon with Active Check & Expiry ---
router.get("/latest-coupon", async (req, res) => {
  try {
    const Coupon = require("../models/Coupon");

    // 🔥 FIX: सिर्फ वही कूपन उठाओ जो 'isActive: true' हो
    // इससे डैशबोर्ड से 'Cancel' बटन दबाते ही यह कूपन मिलना बंद हो जाएगा
    const latestCoupon = await Coupon.findOne({ isActive: true }).sort({
      createdAt: -1,
    });

    if (latestCoupon) {
      const today = new Date();

      // ⏳ Expiry Calculation Logic
      // अगर DB में expiryDate है तो वो लो, नहीं तो createdAt से 7 दिन कैलकुलेट करो
      let expiry = latestCoupon.expiryDate
        ? new Date(latestCoupon.expiryDate)
        : new Date(
            new Date(latestCoupon.createdAt).getTime() +
              7 * 24 * 60 * 60 * 1000,
          );

      const diffInMs = expiry - today;
      const daysLeft = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

      // 🛑 अगर 7 दिन खत्म हो चुके हैं या कूपन पुराना है
      if (daysLeft <= 0) {
        latestCoupon.isActive = false;
        await latestCoupon.save();
        return res.json({ success: false, msg: "Offer Expired!" });
      }

      // ✅ कूपन डेटा और बचे हुए दिन भेजें
      res.json({
        success: true,
        coupon: latestCoupon,
        daysLeft: daysLeft,
      });
    } else {
      // जब कूपन कैंसिल हो जाए, तो 'index.html' पर बॉक्स अपने आप गायब हो जाएगा
      res.json({ success: false, msg: "No active coupon found" });
    }
  } catch (err) {
    console.error("❌ Coupon Route Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🔐 PRIVATE ROUTES (Sirf Logged-in Users ke liye)
// ==========================================

// Profile data lene ke liye
router.get("/me", auth, getProfile);

// Name EDIT aur PHOTO UPLOAD dono isi EK route se honge
router.put("/update-profile", auth, upload.single("profilePic"), updateProfile);

// Razorpay Order Create karna (Isme 'auth' zaruri hai)
router.post("/create-order", auth, paymentController.createOrder);

// ==========================================
// 👨‍✈️ ADMIN ONLY ROUTES (Sirf Admin control kar sakta hai)
// ==========================================

// 1. Bulk Email bhejke Coupon generate karna
router.post("/send-offers", auth, userController.sendMarketingMail);

// 2. Dashboard Stats (Total, VIP, Normal Users)
router.get("/user-stats", auth, userController.getUserStats);

// 3. 🚫 Active Coupon ko Manually CANCEL karna (New Feature)
router.post("/cancel-coupon", auth, async (req, res) => {
  try {
    const Coupon = require("../models/Coupon");
    // Security: Check karo ki user 'admin' hai ya nahi
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Bhai, sirf Admin hi coupon cancel kar sakta hai!" });
    }

    // Saare active coupons ko deactivate kar do
    await Coupon.updateMany({ isActive: true }, { isActive: false });

    res.json({
      success: true,
      msg: "Mubarak ho! Coupon successfully cancel kar diya gaya hai.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📋 1. GET ALL USERS (Full Merged: Users + VIP + Block + Certificate)
router.get("/all-users", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    const Certificate = require("../models/Certificate");

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, msg: "Admin Access Only!" });
    }

    // 👤 Saare Users (Newest First)
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // 📜 Saare Certificates
    const certificates = await Certificate.find().lean();

    // 🔄 Matching Logic (Dhyan se dekho bhai)
    const combinedData = users.map((user) => {
      // ✨ User ID ke last 6 chars se match (Jo terminal mein ✅ aa raha tha)
      const lastSix = user._id.toString().slice(-6).toUpperCase();
      const expectedCertId = `BR30-${lastSix}`;

      const cert = certificates.find((c) => c.certId === expectedCertId);

      return {
        ...user,
        // ✅ Block Status ensure karo (Frontend ke toggle button ke liye)
        isBlocked: user.isBlocked || false,
        isVip: user.isVip || user.badge === "vip",
        certificateFile: cert ? cert.fileName : null,
      };
    });

    res.json({ success: true, users: combinedData });
  } catch (err) {
    console.error("❌ Admin Route Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔄 2. VIP Status Toggle
router.put("/update-vip/:id", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    if (req.user.role !== "admin") return res.status(403).send("Denied");

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User nahi mila");

    user.isVip = !user.isVip;
    user.badge = user.isVip ? "vip" : "normal";

    await user.save();
    res.json({ success: true, msg: "Status Updated!", isVip: user.isVip });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 🗑️ 3. Delete User
router.delete("/delete-user/:id", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    if (req.user.role !== "admin") return res.status(403).send("Denied");

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "User successfully delete ho gaya!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 🚫 4. Block/Unblock Toggle (SINGLE ROUTE)
router.put("/block-user/:id", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    if (req.user.role !== "admin") return res.status(403).send("Denied");

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User nahi mila");

    // ✅ Toggle: True <-> False
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      msg: user.isBlocked ? "User Block ho gaya!" : "User Unblock ho gaya!",
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 💰 1. Saari Sales ki History mangwana (Admin Only)
// 💰 ADMIN SALES HISTORY: Calendar Range & Best Seller Logic
router.get("/sales-history", auth, async (req, res) => {
  try {
    const Order = require("../models/Order");
    const { startDate, endDate } = req.query;

    // 1. Saara data ek baar mangwao
    let allOrders = await Order.find()
      .populate("user", "name email")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    let filteredSales = allOrders;

    // 🔥 SMART DATE FILTER: String aur Date dono ko handle karega
    if (startDate && endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(23, 59, 59, 999);

      filteredSales = allOrders.filter((order) => {
        // Aapke 'String' waale createdAt ko asli Date mein badal raha hai
        const orderDate = new Date(order.createdAt).getTime();
        return orderDate >= start && orderDate <= end;
      });
    }

    // 💰 1. Total Revenue calculation
    const totalRevenue = filteredSales.reduce(
      (sum, order) => sum + order.amount,
      0,
    );

    // 🏆 2. BEST SELLER LOGIC
    const counts = {};
    filteredSales.forEach((order) => {
      const title = order.course?.title || order.courseName || "Other";
      counts[title] = (counts[title] || 0) + 1;
    });
    const bestSeller = Object.keys(counts).reduce(
      (a, b) => (counts[a] > counts[b] ? a : b),
      "No Sales",
    );

    res.json({
      success: true,
      sales: filteredSales,
      totalRevenue,
      bestSeller: bestSeller.toUpperCase(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🎓 GENERATE CERTIFICATE (Final Updated: Single File + ID Based Matching)
router.post("/claim-certificate", auth, async (req, res) => {
  try {
    // 👤 1. User ka data database se nikalo
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User nahi mila!" });
    }

    // 📘 2. DYNAMIC COURSE
    const courseName =
      req.body.courseName || "ADVANCED CRYPTO & OPTION TRADING MASTERCLASS";

    // ✨ 3. UNIQUE ID
    const certId = `BR30-${user._id.toString().substring(18).toUpperCase()}`;
    const fullName = user.name;

    // 🔍 4. DATABASE CHECK (Certificate Collection)
    let existingCert = await Certificate.findOne({ certId: certId });

    if (existingCert) {
      // 🗑️ FILE DELETE: Purani file backup cleanup
      const oldPath = path.join(
        process.cwd(),
        "certificates",
        existingCert.fileName,
      );
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
          console.log("🗑️ Purani file delete ki gayi:", existingCert.fileName);
        } catch (err) {
          console.log("⚠️ File overwrite ho jayegi.");
        }
      }
    }

    // 📄 5. GENERATE PDF (Aapka purana utility function)
    const result = await generateProfessionalCert(
      user,
      fullName,
      certId,
      courseName,
    );

    // 🔗 Download URL taiyar karo
    const downloadUrl = `${process.env.API_BASE_URL || "https://my-backend-1-avpd.onrender.com"}/certificates/${result.fileName}`;

    // 💾 6. CERTIFICATE COLLECTION UPDATE
    if (existingCert) {
      existingCert.fileName = result.fileName;
      existingCert.course = courseName;
      existingCert.date = new Date();
      await existingCert.save();
      console.log("📝 Certificate Record Updated!");
    } else {
      const newCert = new Certificate({
        name: fullName,
        certId: certId,
        course: courseName,
        date: new Date(),
        fileName: result.fileName,
      });
      await newCert.save();
      console.log("✅ New Certificate Record Created!");
    }

    // 🔥 🔥 🔥 7. ASLI FIX: USER MODEL UPDATE (YE MISSING THA)
    // Isse aapka 'User' folder (collection) update hoga
    user.isCertified = true;
    user.certificateData = {
      fullName: fullName,
      certId: certId,
      issueDate: new Date(),
      downloadUrl: downloadUrl, // Response wala same link
      mobile: user.certificateData?.mobile || "", // Purana mobile data safe rakho
      photoUrl: user.certificateData?.photoUrl || "",
    };

    // NESTED OBJECT FIX: Mongoose ko force karo save karne ke liye
    user.markModified("certificateData");
    await user.save();
    console.log("💾 USER MODEL UPDATED IN ATLAS!");

    // ✅ 8. RESPONSE
    res.status(200).json({
      success: true,
      certId: certId,
      downloadUrl: downloadUrl,
    });

    // 📧 9. MAIL
    sendVipCertEmail(user, result.fileName, result.filePath).catch((err) =>
      console.error("❌ Mail Error:", err.message),
    );
  } catch (err) {
    console.error("❌ Critical Error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, msg: "Server Side Issue!" });
    }
  }
});

// 🔍 2. VERIFY CERTIFICATE (Certificate Model se dhoondo)
router.get("/verify-certificate/:id", async (req, res) => {
  try {
    const certId = req.params.id;

    // 🛡️ Naye Certificate Model mein dhoondo
    const cert = await Certificate.findOne({ certId: certId });

    if (!cert) {
      return res.status(404).json({ success: false, msg: "Invalid ID! ❌" });
    }
    res.json({
      success: true,
      studentName: cert.name,
      course: cert.course,
      issueDate: cert.date,
      // Agar variable na mile toh direct URL use ho jaye
      downloadUrl: `${process.env.API_BASE_URL || "https://my-backend-1-avpd.onrender.com"}/certificates/${cert.fileName}`,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
});

// ✅ ये लाइन हमेशा सबसे नीचे होनी चाहिए
module.exports = router;
//#endregion
