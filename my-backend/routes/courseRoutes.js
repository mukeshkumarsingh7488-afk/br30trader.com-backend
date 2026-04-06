//#region Course Routes
// Ye routes humare courses ke liye hain. Isme hum course create, update, delete, aur view karna seekhenge. 
// Jab bhi koi user course purchase karega, toh uska data yahan se process hoke database me save hoga, aur user ko confirmation milega. 
// Admin ke liye bhi kuch special routes honge jisse wo courses ko manage kar sake.

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");
const Course = require("../models/Course");
const uploadCloud = require('../middleware/multerCloudinary');
const multer = require('multer');
const path = require('path');

const {
  createCourse,
  getCourses,
  getMyCourses,
  addVideo,
  getCourseById,
  purchaseCourse,
  getLeaderboard,
  updateCourse, // ✅ Controller se import kiya
  deleteCourse, // ✅ Controller se import kiya
} = require("../controllers/courseController");


// 📁 COURSE THUMBNAIL KE LIYE ALAG STORAGE
const courseStorage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    // 🎯 Seedha Course ID se save karo (Replace logic)
    const ext = path.extname(file.originalname);
    cb(null, req.params.id + ext); 
  }
});
const courseUpload = multer({ storage: courseStorage });

// Route: Isme upload.single("image") hi rehne do
router.put("/update-course/:id", auth, admin, courseUpload.single("image"), updateCourse);


// 1. Leaderboard
router.get("/leaderboard", getLeaderboard);

// 2. Add Course (Admin Only)
router.post("/add", auth, admin, upload.single("thumbnail"), createCourse);

// 3. Get All Courses
router.get("/", getCourses);

// 4. Get User's Purchased Courses
router.get("/my-courses", auth, getMyCourses);

// 5. Purchase Course
router.post("/purchase/:id", auth, purchaseCourse);

// 6. Get Single Course Detail
router.get("/:id", auth, getCourseById);

// 7. Add Video to Course (Admin Only)
router.put("/add-video/:id", auth, admin, addVideo);

// 🚀 8. UPDATE COURSE (Admin Dashboard se Edit ke liye)
router.put("/update-course/:id", auth, admin, courseUpload.single("image"), updateCourse);

router.put('/update/:id', uploadCloud.single('thumbnail'), updateCourse);

// 🗑️ 9. DELETE COURSE (Admin Dashboard se Delete ke liye)
router.delete("/delete-course/:id", auth, admin, deleteCourse);

module.exports = router;
//#endregion