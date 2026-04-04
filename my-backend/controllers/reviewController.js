//#region Imports
const Review = require("../models/Review");
const User = require("../models/User");
//#endregion

//#region POST REVIEW (Show Web Page)
// 1. POST REVIEW (Isme ab sirf ID save karenge, photo nahi)
exports.postReview = async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ userId: userId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Bhai, aap pehle hi review de chuke ho!" });
    }

    // User ki details nikal lo (Name ke liye)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User nahi mila!" });

    const newReview = new Review({
      userId,
      username: user.name, // Humesha latest name lo
      rating,
      comment,
      // ProfilePic yahan save karne ki zaroorat nahi, populate se aayegi
    });

    await newReview.save();
    res.status(201).json({ message: "Review Saved Successfully! ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region GET USER REVIEWS (User ke apne reviews dekhne ke liye)
// ==========================================
// 2. GET TOP REVIEWS (User Webpage Fix)
// ==========================================
exports.getTopReviews = async (req, res) => {
  try {
    // Logic: Wo reviews dikhao jo 'approved' hain YA jinme abhi tak status set nahi hua (Old Reviews)
    const reviews = await Review.find({
      $or: [
        { status: "approved" },
        { status: { $exists: false } } // Purane reviews ke liye
      ]
    })
      .populate("userId", "name profilePic")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion


//#region ADMIN REVIEW MANAGEMENT (Admin Panel ke liye APIs)
// 1. GET ALL REVIEWS (Admin Panel ke liye saara data)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name profilePic") // Latest photo ke liye
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region UPDATE/REPLY REVIEW (Admin Panel ke liye review ka status badalne ya reply dene ke liye)
// 2. UPDATE/REPLY REVIEW (Status badalne ya reply dene ke liye)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body; // Status 'approved'/'hidden' ho sakta hai

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { status, adminReply },
      { new: true }
    );

    if (!updatedReview) return res.status(404).json({ message: "Review nahi mila!" });
    res.status(200).json({ message: "Review Update Ho Gaya! ✅", updatedReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region DELETE REVIEW (Admin Panel ke liye review permanently delete karne ke liye)
// 3. DELETE REVIEW (Permanent hatane ke liye)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) return res.status(404).json({ message: "Review pehle hi delete ho chuka hai!" });
    res.status(200).json({ message: "Review Parmanent Delete Kar Diya! 🗑️" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region TOGGLE REVIEW STATUS (Admin Panel ke liye review ko hide/show karne ke liye)
// 6. TOGGLE STATUS (Hide/Show karne ke liye)
exports.toggleReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Pehle purana status nikal lo
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review nahi mila!" });

    // Agar 'approved' hai toh 'hidden' kar do, aur vice versa
    const newStatus = review.status === 'approved' ? 'hidden' : 'approved';

    review.status = newStatus;
    await review.save();

    res.status(200).json({
      message: `Review ab ${newStatus} ho gaya hai! ✅`,
      status: newStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion
