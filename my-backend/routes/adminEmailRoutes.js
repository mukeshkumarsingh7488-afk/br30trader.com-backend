//#region Admin Email Route
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth"); // Tera auth middleware yahan hai

// ✅ RESEND API SETUP
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// 🔥 FULL HTML TEMPLATE (With All Your Social Links)
const getAnnouncementHTML = (subject, message) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .email-body { background-color: #000000; padding: 40px 20px; font-family: sans-serif; margin: 0; }
        .card { max-width: 600px; margin: auto; background: #0a0a0a; border-radius: 30px; border: 2px solid #00ff88; overflow: hidden; box-shadow: 0 0 40px rgba(0, 255, 136, 0.2); }
        .banner { width: 100%; height: auto; display: block; border-bottom: 3px solid #00ff88; }
        .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
        .alert-title { color: #00ff88 !important; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .message-box { background: rgba(0, 255, 136, 0.03); border-left: 5px solid #00ff88; padding: 25px; border-radius: 12px; line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0; }
        .footer { background: #000000; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
        .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Official Alert" class="banner">
        <div class="content">
            <h1 class="alert-title">📢 OFFICIAL ANNOUNCEMENT</h1>
            <h3 style="color: #ffffff !important; font-size: 20px; margin-top: 25px;">${subject}</h3>
            <div class="message-box">${message}</div>
        </div>
        <div class="footer">
            <div style="color: #64748b; font-size: 13px;">
                Regards,<br>
                <span class="admin-tag">Mukesh Raj(MASTER ADMIN)</span><br>
                BR30ᴛʀᴀᴅᴇʀ Professional Services
            </div>

                        <!-- No-reply Note -->
            <p style="color: #65748a; font-size: 10px; margin-top: 15px; font-style: italic; letter-spacing: 1px;">
                🚫 <b>OFFICIAL NOTE:</b> This is an automated broadcast. Please <b>do not reply</b> to this email.
            </p>

            <!-- 🚀 Social Links -->
<div style="margin-top:25px;padding-top:20px;border-top:1px solid #111;">
    <p style="color:#00ff88;font-size:11px;letter-spacing:2px;">
        JOIN OUR COMMUNITY 🚀
    </p>
            
           <a href="https://www.youtube.com" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22" style="margin:0 5px;">
    </a>

    <!-- Instagram -->
    <a href="https://www.instagram.com/br30traderofficial?igsh=MWN5eHBscWY5bXFvMw==" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22" style="margin:0 5px;">
    </a>

    <!-- Facebook -->
   <a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank">
       <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
       width="17"
       style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
    </a>

    <!-- Telegram -->
    <a href="https://t.me/+F8mDhdfiGaI1NDY1" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22" style="margin:0 5px;">
    </a>

    <!-- WhatsApp -->
    <a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22" style="margin:0 5px;">
    </a>
</div>
            
            <div style="margin-top: 10px; font-size: 10px; color: #9298a3; letter-spacing: 1px; text-align: center;">
                EST. 2026 | SECURE TRADING ENVIRONMENT | © BR30ᴛʀᴀᴅᴇʀ
            </div>
        </div>
    </div>
</body>
</html>`;

// 🚀 YE RAHA TERA ROUTE (Bina kisi galti ke)
router.post("/send-all-email", auth, async (req, res) => {
    const { subject, message } = req.body;

    if (!subject || !message) {
        return res.status(400).json({ msg: "Subject aur message dono chahiye bhai!" });
    }

    try {
        const users = await User.find({ email: { $exists: true, $ne: "" } }, "email");
        
        if (users.length === 0) {
            return res.status(404).json({ msg: "Database khali hai!" });
        }

        const emailList = users.map((user) => user.email);

        // Template logic
        let emailTemplate = getAnnouncementHTML(subject, message);
        const templatePath = path.join(__dirname, "../views/email.html");

        if (fs.existsSync(templatePath)) {
            let fileContent = fs.readFileSync(templatePath, "utf-8");
            emailTemplate = fileContent.replace("{{message}}", message);
        }

        // Resend API Call
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: emailList,
            subject: `📢 ${subject}`,
            html: emailTemplate,
        });

        res.status(200).json({ msg: `Mast! ${emailList.length} users ko mail chala gaya.` });

    } catch (err) {
        console.error("🔥 Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
//#endregion
