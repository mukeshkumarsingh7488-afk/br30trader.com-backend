//#region ━━━━━ 🚀 WELCOME DEVELOPER | REVIEW SYSTEM INITIALIZED ━━━━━
const Review = require("../models/Review");
const User = require("../models/User");
const { generateSmartReply } = require("../utils/reviewReply");

// 1. ⭐ POST NEW REVIEW | LOGIC: PERSISTING USER FEEDBACK VIA OBJECT ID (NO MEDIA)
exports.postReview = async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;

    const existingReview = await Review.findOne({ userId: userId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already submitted a review!" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User nahi mila!" });

    const newReview = new Review({
      userId,
      username: user.name,
      rating,
      comment,
    });

    await newReview.save();

    const updatedCount = await Review.countDocuments();

    if (req.app.get("socketio")) {
      req.app.get("socketio").emit("updateReviewCount", updatedCount);
    }

    res.status(201).json({
      message: "Review Saved Successfully! ✅",
      totalCount: updatedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. 👤 FETCH MY REVIEWS | LOGIC: RETRIEVING AUTHENTICATED USER'S FEEDBACK HISTORY
exports.getTopReviews = async (req, res) => {
  try {
    const totalReviewCount = await Review.countDocuments();

    const reviews = await Review.aggregate([
      {
        $match: {
          $or: [{ status: "approved" }, { status: { $exists: false } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      totalCount: totalReviewCount,
      reviews: reviews,
    });
  } catch (err) {
    console.error("Aggregation Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. 📂 FETCH ALL REVIEWS | LOGIC: AGGREGATING GLOBAL FEEDBACK DATA FOR ADMIN MODERATION
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name profilePic")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. 💬 UPDATE/REPLY TO REVIEW | LOGIC: ADMIN FEEDBACK ENGAGEMENT & STATUS MANAGEMENT
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { status, adminReply },
      { new: true },
    );

    if (!updatedReview)
      return res.status(404).json({ message: "Review nahi mila!" });
    res
      .status(200)
      .json({ message: "Review Update Ho Gaya! ✅", updatedReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//#region DELETE REVIEW (Admin Panel ke liye review permanently delete karne ke liye)
// 3. DELETE REVIEW (Permanent hatane ke liye)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview)
      return res
        .status(404)
        .json({ message: "Review pehle hi delete ho chuka hai!" });
    res.status(200).json({ message: "Review Parmanent Delete Kar Diya! 🗑️" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

// 6. 🌓 TOGGLE REVIEW VISIBILITY | LOGIC: CONTROLLING PUBLIC DISPLAY (HIDE/SHOW) VIA ADMIN PANEL
exports.toggleReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review nahi mila!" });

    const newStatus = review.status === "approved" ? "hidden" : "approved";

    review.status = newStatus;
    await review.save();

    res.status(200).json({
      message: `Review ab ${newStatus} ho gaya hai! ✅`,
      status: newStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. 💾 PERSIST TO DATABASE | LOGIC: EXECUTING ATOMIC UPDATES & DATA INTEGRITY CHECKS
async function saveReply(reviewId, message) {
  try {
    await Review.findOneAndUpdate(
      { _id: reviewId, adminReply: { $in: ["", null] } },
      {
        adminReply: message,
        replied: true,
      },
    );

    console.log("✅ Reply saved:", reviewId);
  } catch (err) {
    console.error("❌ Error saving reply:", err);
  }
}

// 8. 🤖 AUTO-RESPONSE ENGINE | LOGIC: TRIGGERING AUTOMATED REPLIES FOR SYSTEM & API TASKS
exports.handleAutoReply = async (req, res) => {
  try {
    const reviews = req.body.reviews;

    for (let review of reviews) {
      if (review.replied) continue;

      const reply = generateSmartReply(review);

      if (!reply) {
        console.log("⚠️ Manual needed:", review._id);
        continue;
      }

      const finalReply = reply + "\n— Team BR30 Trader Academy 🚀";

      await saveReply(review._id, finalReply);
    }

    res.json({ success: true, message: "Auto replies processed 🚀" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// 9. 🧹 BULK HIDE / SHOW REVIEWS
exports.bulkUpdateReviewStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Review IDs required!" });
    }

    if (!["approved", "hidden"].includes(status)) {
      return res.status(400).json({ message: "Invalid status!" });
    }

    const result = await Review.updateMany(
      { _id: { $in: ids } },
      { $set: { status } },
    );

    res.status(200).json({
      message: `${result.modifiedCount} reviews ${status} ho gaye! ✅`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 10. 💬 BULK REPLY REVIEWS
exports.bulkReplyReviews = async (req, res) => {
  try {
    const { ids, adminReply } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Review IDs required!" });
    }

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({ message: "Reply text required!" });
    }

    const result = await Review.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          adminReply: adminReply.trim(),
          replied: true,
        },
      },
    );

    res.status(200).json({
      message: `${result.modifiedCount} reviews me reply save ho gaya! ✅`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 11. 🗑️ BULK DELETE REVIEWS
exports.bulkDeleteReviews = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Review IDs required!" });
    }

    const result = await Review.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message: `${result.deletedCount} reviews delete ho gaye! 🗑️`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion
// ==========================================================================
// ✅ REVIEW STATUS: CUSTOMER FEEDBACK & RATING LOGIC FULLY REFACTORED.
// ⭐ ENGAGEMENT: AUTO-REPLIES & MODERATION TOOLS FULLY OPERATIONAL.
// 🚀 DEPLOYMENT: REVIEW SYSTEM IS READY FOR PRODUCTION SOCIAL PROOF!
// ==========================================================================
