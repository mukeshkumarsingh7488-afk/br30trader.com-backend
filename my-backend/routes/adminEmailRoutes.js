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
        <img src="https://ibb.co" alt="BR30 Official Alert" class="banner">
        <div class="content">
            <h1 class="alert-title">📢 OFFICIAL ANNOUNCEMENT</h1>
            <h3 style="color: #ffffff !important; font-size: 20px; margin-top: 25px;">${subject}</h3>
            <div class="message-box">${message}</div>
        </div>
        <div class="footer">
            <div style="color: #64748b; font-size: 13px;">
                Regards,<br>
                <span class="admin-tag">MUKESH RAJ (MASTER ADMIN)</span><br>
                BR30ᴛʀᴀᴅᴇʀ Professional Services
            </div>
            
            <!-- 🚀 SOCIAL LINKS (TERE SARE LINKS) -->
            <div style="margin-top:25px;padding-top:20px;border-top:1px solid #111;">
                <p style="color:#00ff88;font-size:11px;letter-spacing:2px;">JOIN OUR COMMUNITY 🚀</p>
                <a href="https://youtube.com" target="_blank"><img src="https://flaticon.com" width="22" style="margin:0 5px;"></a>
                <a href="https://instagram.com" target="_blank"><img src="https://flaticon.com" width="22" style="margin:0 5px;"></a>
                <a href="https://t.me" target="_blank"><img src="https://flaticon.com" width="22" style="margin:0 5px;"></a>
                <a href="https://whatsapp.com" target="_blank"><img src="https://flaticon.com" width="22" style="margin:0 5px;"></a>
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
