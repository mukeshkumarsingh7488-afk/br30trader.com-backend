//#region IMPORTS
const Course = require("../models/Course");
const User = require("../models/User");
const fs = require('fs');
const path = require('path');
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
exports.updateCourse = async (req, res) => {
  try {
    console.log("-----------------------------------------");
    console.log("🚀 Request Aayi! ID:", req.params.id);
    console.log("📦 Body Data:", req.body);
    console.log("📷 Uploaded File:", req.file ? req.file.filename : "Koi file nahi mili!");

    const { title, price, videoUrl } = req.body;

    // 🎯 1. Normal fields setup
    let updateFields = { title, price };

    // 🎯 2. Video URL Update
    if (videoUrl) {
      console.log("📹 Updating Video URL...");
      updateFields["videos.0.videoUrl"] = videoUrl;
    }

    // 🚀 3. AGAR NAYI FILE HAI TOH PURANI WALI DELETE KARO
    if (req.file) {
      console.log("🔍 Checking for old thumbnail to delete...");
      
      const oldCourse = await Course.findById(req.params.id);
      
      if (oldCourse && oldCourse.thumbnail) {
        // Path fix: 'uploads/file.jpg' format ke liye
        const relativePath = oldCourse.thumbnail.startsWith('/') ? oldCourse.thumbnail : `/${oldCourse.thumbnail}`;
        const oldFilePath = path.join(__dirname, '..', '..', 'public', relativePath); // Path check kar lena apne folder structure ke hisab se
        
        console.log("🗑️ Purana path delete karne ki koshish:", oldFilePath);

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log("✅ Old thumbnail deleted successfully!");
        } else {
          console.log("⚠️ Purani file disk pe nahi mili (Shayad Render ne delete kar di ho).");
        }
      }

      // Nayi file set karo
      updateFields.thumbnail = `/uploads/${req.file.filename}`; 
      console.log("✅ New thumbnail path set:", updateFields.thumbnail);
    }

    // 🎯 4. Final Update Database mein
    console.log("💾 Database update ho raha hai...");
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedCourse) {
      console.log("❌ Course nahi mila!");
      return res.status(404).json({ success: false, msg: "Course nahi mila!" });
    }

    console.log("🎉 Sab kuch update ho gaya!");
    res.json({ success: true, msg: "Title, Price, Thumbnail aur Video URL sab update ho gaya! 🚀" });

  } catch (err) {
    console.error("🔥 Error in updateCourse:", err.message);
    res.status(500).json({ success: false, error: err.message });
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

    if (!course) return res.status(404).json({ msg: "Course nahi mila!" });

    // Check agar pehle se kharida hai
    if (user.purchasedCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ msg: "Aapne ye course pehle hi kharid liya hai!" });
    }

    // 1. Data Update (Course add + VIP Badge)
    user.purchasedCourses.push(courseId);
    user.badge = "vip";
    user.isVip = true;
    await user.save();

    // 2. VIP WELCOME MAIL (Green Neon Theme)
    const welcomeHTML = `
  <!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <style>
        /* ================= GLOBAL ================= */
        .email-body {
            background-color: #000;
            padding: 40px 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            -webkit-font-smoothing: antialiased;
        }

        .card {
            max-width: 600px;
            margin: auto;
            background: #0a0a0a;
            border-radius: 30px;
            border: 2px solid #00ff88;
            overflow: hidden;
            box-shadow: 0 0 40px rgba(0, 255, 136, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0 60px rgba(0, 255, 136, 0.5);
        }

        /* ================= BANNER ================= */
        .banner {
            width: 100%;
            display: block;
            border-bottom: 3px solid #00ff88;
        }

        /* ================= CONTENT ================= */
        .content {
            padding: 45px 35px;
            text-align: center;
            color: #fff;
        }

        .alert-title {
            color: #00ff88;
            font-size: 28px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 0 0 15px #00ff88;
            margin-bottom: 25px;
        }

        .message-box {
            background: rgba(0, 255, 136, 0.05);
            border-left: 5px solid #00ff88;
            padding: 25px;
            border-radius: 12px;
            color: #e2e8f0;
            font-size: 16px;
            margin-bottom: 25px;
            text-align: left;
        }

        /* ================= BUTTON ================= */
        .login-btn {
            display: inline-block;
            padding: 15px 35px;
            background: #00ff88;
            color: #000;
            font-weight: 900;
            text-decoration: none;
            border-radius: 10px;
            box-shadow: 0 0 20px #00ff88;
            transition: all 0.3s ease;
        }

        .login-btn:hover {
            background: transparent;
            color: #00ff88;
            border: 2px solid #00ff88;
            box-shadow: 0 0 25px #00ff88;
        }

        /* ================= FOOTER ================= */
        .footer {
            background: #000;
            padding: 35px;
            text-align: center;
            border-top: 1px solid #111;
            color: #64748b;
            font-size: 13px;
        }

        .admin-tag {
            color: #00ff88;
            font-weight: 800;
            font-size: 16px;
            letter-spacing: 1px;
        }

        /* ================= SOCIAL ICONS ================= */
        .social-links a {
            margin: 0 10px;
            display: inline-block;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .social-links a img {
            width: 24px;
            height: 24px;
            display: inline-block;
            border-radius: 5px;
        }

        .social-links a:hover {
            transform: translateY(-3px);
            box-shadow: 0 0 15px #00ff88;
        }

        /* ================= MOBILE ================= */
        @media only screen and (max-width: 480px) {
            .alert-title {
                font-size: 22px;
            }

            .content {
                padding: 30px 20px;
            }

            .login-btn {
                padding: 12px 25px;
            }
        }
    </style>
</head>

<body class="email-body">
    <div class="card">
        <!-- Banner -->
        <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Official" class="banner">

        <!-- Content -->
        <div class="content">
            <h1 class="alert-title">💎 VIP ACCESS UNLOCKED🚀</h1>
            <div class="message-box">
                Hi <b>${user.name}</b>,<br><br>
                🎉Congratulations! Aapne successfully <b>${course.title}</b> purchase kar liya hai.
                Aapka <b>VIP BADGE</b> ab active ho gaya hai. 💸
            </div>
            <a href="http://youtube.com" class="login-btn">START LEARNING NOW</a>
        </div>

        <!-- Footer -->
        <div class="footer">
            Regards,<br>
            <span class="admin-tag">BR30 Support Team</span><br>
            Official Support & Security Division

                <!-- No-reply Note -->
            <p style="color: #65748a; font-size: 10px; margin-top: 15px; font-style: italic; letter-spacing: 1px;">
                🚫 <b>OFFICIAL NOTE:</b> This is an automated broadcast. Please <b>do not reply</b> to this email.
            </p>

            <!-- Social Links -->
     <!-- 🚀 Social Links -->
<div style="margin-top:25px;padding-top:20px;border-top:1px solid #111;">
    <p style="color:#00ff88;font-size:11px;letter-spacing:2px;">
        JOIN OUR COMMUNITY 🚀
    </p>

    <!-- YouTube -->
    <a href="https://www.youtube.com" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22" style="margin:0 5px;">
    </a>

    <!-- Instagram -->
    <a href="https://www.instagram.com" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22" style="margin:0 5px;">
    </a>

    <!-- Telegram -->
    <a href="https://t.me" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22" style="margin:0 5px;">
    </a>

    <!-- WhatsApp -->
    <a href="https://chat.whatsapp.com" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22" style="margin:0 5px;">
    </a>
</div>

            <div style="margin-top: 10px; font-size: 10px; color: #9298a3; letter-spacing: 1px;">
                EST. 2024 | SECURE TRADING ENVIRONMENT | © BR30ᴛʀᴀᴅᴇʀ
            </div>
        </div>
    </div>
</body>

</html>`;

    // Email bhej do
    const transporter = require("../utils/mailer");
    transporter
      .sendMail({
        from: `"BR30 Premium" <${process.env.SUPPORT_EMAIL_USER}>`,
        to: user.email,
        subject: "💎 VIP Status Unlocked: Welcome to the Elite Circle!",
        html: welcomeHTML,
      })
      .catch((e) => console.log("Mail error: ", e.message));

    // Final Response
    res.json({
      msg: "Congratulations! Course Purchased & VIP Badge Unlocked! 💎",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region 7. GET LEADERBOARD (Top VIP Traders)
// 🏆 7. GET LEADERBOARD (Top VIP Traders)
exports.getLeaderboard = async (req, res) => {
  try {
    const topTraders = await User.find({ badge: "vip" })
      .select("name monthlyProfit profilePic badge")
      .sort({ monthlyProfit: -1 })
      .limit(10);
    res.json(topTraders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion