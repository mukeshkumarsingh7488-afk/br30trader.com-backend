//#region IMPORTS
const Course = require("../models/Course");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const { purchaseTemplate } = require("../utils/emailHelper");
const cloudinary = require("cloudinary").v2;
const fakeVips = require("../fakeUsers");

const jwt = require("jsonwebtoken");
//#endregion

//#region Create Course (Admin Create Course Pannel)
exports.createCourse = async (req, res) => {
  console.log("🚀 Body Aayi:", req.body); // Check Title, Price
  console.log("📂 File Aayi:", req.file); // Check Photo
  console.log("👤 User Aaya:", req.user);
  try {
    const { title, description, price } = req.body;

    const newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user.id,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : "",
      videos: [],
    });

    const course = await newCourse.save();
    res.json({ msg: "Course added successfully!", course });
  } catch (err) {
    console.error("❌ CREATE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region add Video Function (Admin Create Course Pannel ke Andar)
exports.addVideo = async (req, res) => {
  try {
    const { title, videoUrl } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ msg: "Course nahi mila" });

    if (!course.videos || typeof course.videos === "undefined") {
      course.videos = [];
    }

    course.videos.push({ title, videoUrl });

    course.markModified("videos");
    await course.save();

    res.json({ msg: "Video successfully add ho gayi!", course });
  } catch (err) {
    console.error("❌ ADD VIDEO ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region 2. UPDATE COURSE (Admin Course Management ke andar Edit Course ke liye)
// ✅ 1. UPDATE COURSE (Controller Function)
// 📁 controllers/courseController.js

exports.updateCourse = async (req, res) => {
  try {
    console.log("=================================");
    console.log("🚀 Update Course Start");

    const { title, price } = req.body;

    let updateFields = { title, price };

    // 🔥 IMAGE HANDLE
    if (req.file) {
      console.log("📷 Cloudinary File:", req.file);

      // ✅ DIRECT URL (NO MANUAL URL)
      updateFields.thumbnail = req.file.path;

      console.log("🌩️ Cloudinary URL:", req.file.path);
    } else {
      console.log("ℹ️ No new image uploaded");
    }

    console.log("📦 Final Data:", updateFields);

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true },
    );

    console.log("🎉 Update Success");

    res.json({
      success: true,
      data: updatedCourse,
    });
  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

//#endregion

//#region 3. DELETE COURSE (Admin course Management ke andar Delete Course ke liye)
// ✅ 2. DELETE COURSE (Controller Function)
exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse)
      return res.status(404).json({ success: false, msg: "Course nahi mila!" });
    res.json({ success: true, msg: "Course deleted! 🗑️" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
//#endregion

//#region 4. GET COURSES (Admin Course Management ke andar Sabhi Course Show Karna)
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region GET MY COURSES (User Dashboard ke Andar)
exports.getMyCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("purchasedCourses");
    res.json(user.purchasedCourses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region GET COURSE BY ID (Admin Course Management ke andar Course ID ke Sath Dikhana)
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: "Course nahi mila" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region 5. COURSE PURCHASE LOGIC (VIP Badge + Welcome Mail)
// 🔥 5. COURSE PURCHASE LOGIC (VIP Badge + Welcome Mail)
exports.purchaseCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ msg: "Course nahi mila!" });
    }

    // Already purchased check
    if (user.purchasedCourses.includes(courseId)) {
      return res.status(400).json({
        msg: "Aapne ye course pehle hi kharid liya hai!",
      });
    }

    // ✅ 1. Update user
    user.purchasedCourses.push(courseId);
    user.badge = "vip";
    user.isVip = true;
    await user.save();

    // ✅ 2. EMAIL LOGIC (CLEAN)
    try {
      const html = purchaseTemplate(user.name, course.title);

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "💎 VIP Status Unlocked: Welcome to the Elite Circle!",
        html: html,
      });

      console.log("💎 VIP Welcome Email Sent! ✅");
    } catch (mailErr) {
      console.log("❌ Mail Error:", mailErr.message);
    }

    // ✅ 3. Response
    res.json({
      msg: "Congratulations! Course Purchased & VIP Badge Unlocked! 💎",
    });
  } catch (err) {
    console.error("🔥 Purchase Error:", err);
    res.status(500).json({ error: err.message });
  }
};

//#endregion

//#region 7. GET LEADERBOARD (Top VIP Traders)
// 🏆 7. GET LEADERBOARD (Updated with Fake Users & Personalization)
exports.getLeaderboard = async (req, res) => {
  console.log("Fake Users Loaded:", fakeVips.length);

  try {
    // 1. Database se real VIP users uthao
    let topTraders = await User.find({ badge: "vip" })
      .select("name monthlyProfit profilePic badge isVip")
      .sort({ monthlyProfit: -1 })
      .limit(15) // Thode zyada real users le lo taaki list bhari lage
      .lean();

    // 2. Real users ke saath Fake users mix karo
    let combinedList = [...topTraders, ...fakeVips];

    // 3. JWT se logged-in user ko Rank 1 par lane ka logic
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(" ")[1]; // Bearer Token format
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Apni Secret Key check karna
        const loggedInUserId = decoded.id;

        // Check karo ki logged-in user list mein hai ya nahi
        const userIndex = combinedList.findIndex(
          (u) => u._id && u._id.toString() === loggedInUserId,
        );

        if (userIndex !== -1) {
          const myProfile = combinedList[userIndex];
          // Agar user VIP hai, toh use utha kar Index 0 (Rank 1) par daal do
          if (myProfile.badge === "vip" || myProfile.isVip) {
            combinedList.splice(userIndex, 1); // Purani rank se hatao
            combinedList.unshift(myProfile); // Rank 1 par daalo
          }
        }
      } catch (jwtErr) {
        // Token galat ho toh normal list dikhao, error mat do
      }
    }

    // 4. Final list bhej do
    res.json(combinedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//#endregion
