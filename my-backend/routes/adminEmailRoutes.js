//#region Admin Email Route
// Ye route humare admin ke liye hai jisse wo sabhi users ko ek saath email bhej sakta hai. 
// Admin jab bhi koi important announcement karna chahe, toh wo is route ka use karke apne message ko sabhi users tak pahuncha sakta hai. 
// Isme hum nodemailer ka use karenge email bhejne ke liye, aur ek special HTML template banayenge jo email ko attractive banayega.
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SEND_EMAIL_USER,
    pass: process.env.SEND_EMAIL_PASS,
  },
});

router.post("/send-all-email", auth, async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ msg: "Subject aur message required hai!" });
  }

  try {
    const users = await User.find(
      { email: { $exists: true, $ne: "" } },
      "email",
    );

    if (users.length === 0) {
      return res.status(404).json({ msg: "Database me koi user nahi mila!" });
    }

    const emailList = users.map((user) => user.email);

    // 🔥 NEON ANNOUNCEMENT TEMPLATE - Updated for Clarity & Standard English
    const getAnnouncementHTML = (subject, message) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Web & Laptop Rendering Fix */
        .email-body { 
            background-color: #000000; 
            padding: 40px 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            -webkit-font-smoothing: antialiased;
            margin: 0; 
        }
        .card { max-width: 600px; margin: auto; background: #0a0a0a; border-radius: 30px; border: 2px solid #00ff88; overflow: hidden; box-shadow: 0 0 40px rgba(0, 255, 136, 0.2); }
        .banner { width: 100%; height: auto; display: block; border-bottom: 3px solid #00ff88; }
        
        /* Content Styling */
        .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
        .alert-title { color: #00ff88 !important; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        
        /* Professional Message Box */
        .message-box { 
            background: rgba(0, 255, 136, 0.03); 
            border-left: 5px solid #00ff88; 
            padding: 25px; 
            border-radius: 12px; 
            line-height: 1.8; 
            color: #e2e8f0 !important; 
            font-size: 16px; 
            margin: 25px 0; 
        }
        
        /* Footer & Signature */
        .footer { background: #000000; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
        .signature { color: #64748b; font-size: 13px; line-height: 1.6; }
        .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; letter-spacing: 1px; }
        
        /* Mobile OTP fix */
        @media only screen and (max-width: 480px) {
            .alert-title { font-size: 20px; }
            .content { padding: 30px 20px; }
        }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <!-- Official Banner -->
        <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Official Alert" class="banner">
        
        <div class="content">
            <h1 class="alert-title">📢 OFFICIAL ANNOUNCEMENT</h1>
            
            <h3 style="color: #ffffff !important; font-size: 20px; margin-top: 25px; margin-bottom: 10px;">
                ${subject}
            </h3>
            
            <div class="message-box">
                ${message}
            </div>
            
            <p style="color: #94a3b8 !important; font-size: 14px; text-align: center; margin-top: 35px; font-style: italic; line-height: 1.6;">
    <b>Attention Trader:</b> This is a high-priority update. Please review and take the necessary action immediately. 🚀
</p>

            </p>
        </div>

        <div class="footer">
            <div class="signature">
                Regards,<br>
                <span class="admin-tag">MUKESH RAJ (MASTER ADMIN)</span><br>
                BR30ᴛʀᴀᴅᴇʀ Professional Services
            </div>

            <!-- OFFICIAL NO-REPLY ALERT -->
            <p style="color: #6c7a8e !important; font-size: 10px; margin-top: 25px; font-style: italic; letter-spacing: 1px;">
                🚫 <b>OFFICIAL NOTE:</b> This is an automated broadcast. Please <b>do not reply</b> to this email.
            </p>

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

            <div style="margin-top: 30px; font-size: 10px; color: #666f7f; letter-spacing: 1px;">
                EST. 2024 | SECURE TRADING ENVIRONMENT | © BR30ᴛʀᴀᴅᴇʀ
            </div>
        </div>
    </div>
</body>
</html>`;

    let emailTemplate = getAnnouncementHTML(subject, message);

    const templatePath = path.join(__dirname, "../views/email.html");
    if (fs.existsSync(templatePath)) {
      let fileContent = fs.readFileSync(templatePath, "utf-8");
      emailTemplate = fileContent.replace("{{message}}", message);
    }

    const mailOptions = {
      from: `"BR30 Official Announcement" <${process.env.SEND_EMAIL_USER}>`,
      bcc: emailList.join(","),
      subject: `📢 ${subject}`,
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);

    console.log(
      `✅ Special Admin email sent via ${process.env.SEND_EMAIL_USER}`,
    );
    res.status(200).json({
      msg: `Successfully ${emailList.length} users ko special mail bhej diya!`,
    });
  } catch (err) {
    console.error("❌ Admin email error:", err);
    res.status(500).json({ msg: "Server error: Mail nahi ja paya!" });
  }
});

// 🔥 ISSE PAKKA CHECK KARNA LAST MEIN
module.exports = router;
//#endregion