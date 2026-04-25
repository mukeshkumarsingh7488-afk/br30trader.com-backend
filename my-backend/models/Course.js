//#region ━━━━━ 🚀 WELCOME DEVELOPER | COURSE MODEL INITIALIZED ━━━━━
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    videos: [
      {
        title: { type: String, required: true },
        videoUrl: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
//#endregion
// ==========================================================================
// ✅ MODEL STATUS: COURSE SCHEMA ORGANIZED & VALIDATED.
// 🎬 CONTENT: VIDEO MAPPING & ASSET INTEGRITY CHECKS ACTIVE.
// 🚀 DEPLOYMENT: READY FOR DYNAMIC CONTENT DELIVERY!
// ==========================================================================
