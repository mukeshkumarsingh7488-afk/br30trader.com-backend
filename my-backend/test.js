/// ==========================================
// 👨‍✈️ ADMIN PANEL ROUTES (User Management)
// ==========================================

// 📋 1. सारे Users की लिस्ट देखना (Sirf Admin)
router.get("/all-users", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    // सुरक्षा: चेक करो कि रिक्वेस्ट भेजने वाला 'admin' है या नहीं
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Bhai, access denied! Sirf Admin ke liye hai." });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔄 2. VIP Status Toggle (Normal <-> VIP)
router.put("/update-vip/:id", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    if (req.user.role !== "admin") return res.status(403).send("Denied");

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User nahi mila");

    // VIP Status को पलट दो
    user.isVip = !user.isVip;
    user.badge = user.isVip ? "vip" : "normal";

    await user.save();
    res.json({
      success: true,
      msg: `User status updated to ${user.badge}!`,
      isVip: user.isVip,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
