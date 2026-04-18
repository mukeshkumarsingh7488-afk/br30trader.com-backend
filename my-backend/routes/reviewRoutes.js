//#region Review Routes
// Ye routes humare reviews ke liye hain. Isme hum review add karna, top reviews dekhna, aur admin ke liye review manage karne ke routes banayenge.
// Jab bhi koi user course complete karega, toh uska review yahan se add hoke database me save hoga, aur future me wo review top reviews me dikhai dega.
const express = require("express");
const router = express.Router();
const reviewController,
  handleAutoReply = require("../controllers/reviewController");

// --- User Routes (Pehle se jo hain) ---
router.post("/add", reviewController.postReview);
router.get("/top10", reviewController.getTopReviews);

// --- Admin Routes (Jo humein ab chahiye) ---

// 1. Saare reviews dekhne ke liye (Admin Panel mein)
router.get("/all", reviewController.getAllReviews);

// 2. Review ko update karne ke liye (Reply dene ya Status change karne ke liye)
router.put("/update/:id", reviewController.updateReview);

// 3. Review ko hide/show karne ke liye (Aap isse status badal sakte ho)
router.patch("/status/:id", reviewController.toggleReviewStatus);

// 4. Review ko permanent delete karne ke liye
router.delete("/delete/:id", reviewController.deleteReview);

// auto replay review
router.post("/auto-reply", handleAutoReply);
module.exports = router;
//#endregion
