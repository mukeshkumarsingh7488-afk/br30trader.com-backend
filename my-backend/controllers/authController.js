//#region IMPORTS & CONFIG
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

//#endregion

//#region Master Admin Email (Jo .env se aayega)
// .env se config uthana
const MASTER_ADMIN_EMAIL = process.env.MASTER_ADMIN_EMAIL;
//#endregion

//#region User Register EMAIL TEMPLATES (Professional Neon Designs)
// ==========================================
// 🔥 1. TEMPLATES (Professional Neon Designs)
// ==========================================

// User Template (Support - Blue Theme)
const userTemplate = (name, otp) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .email-body { background-color: #0f172a; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; }
        .card { max-width: 500px; margin: auto; background: #1e293b; border-radius: 24px; border: 1px solid #3b82f6; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .banner { width: 100%; height: auto; display: block; border-bottom: 2px solid #3b82f6; }
        .content { padding: 40px 30px; text-align: center; color: #ffffff; }
        .welcome-txt { color: #3b82f6; font-size: 22px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .otp-box { background: #0f172a; border: 1px dashed #3b82f6; border-radius: 16px; padding: 25px; margin: 30px 0; }
        .otp-code { margin: 0; font-size: 35px; letter-spacing: 8px; color: #3b82f6; font-weight: 800; text-shadow: 0 0 10px rgba(59, 130, 246, 0.4); word-break: break-all;}
        .warning-txt { color: #f87171; font-size: 13px; font-weight: 600; margin-top: 20px; }
        .footer { background: #111827; padding: 25px; text-align: center; border-top: 1px solid #334155; }
        .signature { color: #94a3b8; font-size: 13px; line-height: 1.6; }
        .brand-name { color: #3b82f6; font-weight: 700; font-size: 15px; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <!-- Register Banner Link Yahan Dalna -->
        <img src="https://i.ibb.co/3VzZ21W/blue-burner-jpg.jpg" alt="BR30 Welcome Banner" class="banner">
        
        <div class="content">
            <div class="welcome-txt">Welcome to BR30ᴛʀᴀᴅᴇʀ</div>
            <p style="color: #94a3b8; font-size: 15px;">Hi <b>${name}</b>, your journey to professional trading starts here. Use the secure code below to verify your account.</p>
            
            <div class="otp-box">
                <h1 class="otp-code">${otp}</h1>
            </div>
            
            <p class="warning-txt">⚠️ Valid for 10 minutes. Do not share this with anyone.</p>
            <p style="color: #555; font-size: 11px; margin-top: 10px;">

        </div>

             <div class="footer">
            <div class="signature">
                Regards,<br>
                <span class="brand-name">BR30 Support Team</span><br>
                Official Support & Security Division
            </div>

            <!-- 1. NO-REPLY MESSAGE (Auto-generated alert) -->
            <p style="color: #b9acac; font-size: 10px; margin-top: 20px; font-style: italic; text-align: center;">
                🚫 <b>Note:</b> This is an auto-generated email. Please <b>do not reply</b> to this message.
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

           <div style="margin-top: 25px; font-size: 10px; color: #576172; text-align: center;">
                © 2026 BR30 Global Service. Secure Access Guaranteed.
            </div>
        </div>
    </div> <!-- Ye Card wala div band ho raha hai -->
</body>
</html>`;
//#endregion

//#region Admin Template (Master Admin - Gold & Red Premium Edition)
// 🔥 MASTER ADMIN TEMPLATE - Gold & Red Premium Edition
const adminTemplate = (name, otp) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Web & Laptop Clarity Fix */
        .email-body { 
            background-color: #000000; 
            padding: 40px 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            -webkit-font-smoothing: antialiased;
            margin: 0; 
        }
        .card { max-width: 500px; margin: auto; background: #0a0a0a; border-radius: 24px; border: 2px solid #d4af37; overflow: hidden; box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .banner { width: 100%; height: auto; display: block; border-bottom: 2px solid #d4af37; }
        
        /* Premium Content Styling */
        .content { padding: 40px 30px; text-align: center; color: #ffffff !important; }
        .admin-header { color: #d4af37 !important; font-size: 22px; font-weight: 800; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 2px; }
        
        /* Gold/Red OTP Box */
        .otp-box { background: rgba(212, 175, 55, 0.05); border: 1px dashed #d4af37; border-radius: 16px; padding: 25px; margin: 30px 0; }
        .otp-code { 
            margin: 0; 
            font-size: 38px; 
            letter-spacing: 10px; 
            color: #ff4d4d !important; /* Admin OTP in Red for Alert feel */
            font-weight: 800; 
            text-shadow: 0 0 15px rgba(255, 77, 77, 0.4); 
            word-break: break-all;
        }
        
        .footer { background: #000000; padding: 30px; text-align: center; border-top: 1px solid #1a1a1a; }
        .signature { color: #64748b !important; font-size: 13px; line-height: 1.6; }
        .admin-tag { color: #d4af37 !important; font-weight: 700; font-size: 15px; letter-spacing: 1px; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <!-- Master Admin Gold Banner -->
        <img src="https://i.ibb.co/chKP57C1/gold-burner-jpg.jpg" alt="Admin Premium Access" class="banner">
        
        <div class="content">
            <div class="admin-header">👑 Master Admin Authentication</div>
            
            <!-- Professional Admin Message -->
            <p style="color: #cbd5e1 !important; font-size: 15px; line-height: 1.6;">
                Hello <b>Dear Mukesh Raj</b>,<br> 
                A secure login or credential reset has been initiated for the Master Admin account. Please use the high-security verification code below:
            </p>
            
            <div class="otp-box">
                <h1 class="otp-code">${otp}</h1>
            </div>
            
            <p style="color: #ff4d4d !important; font-size: 12px; font-weight: bold; letter-spacing: 1px;">
                ⚠️ CONFIDENTIAL: DO NOT SHARE THIS CODE.
            </p>
        </div>

        <div class="footer">
            <div class="signature">
                Regards,<br>
                <span class="admin-tag">BR30 Support Team</span><br>
                System Master Admin Access 
            </div>

           <!-- ROOT AUTHENTICATION NOTE (VVIP Feel) -->
<p style="color: #ffd700 !important; font-size: 11px; margin-top: 25px; font-weight: bold; letter-spacing: 1.5px; text-align: center; text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);">
    🛡️ ROOT AUTHENTICATION: Verified Master Admin Login Detected.
</p>

    <!-- No-reply Note -->
            <p style="color: #65748a; font-size: 10px; margin-top: 15px; font-style: italic; letter-spacing: 1px;">
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

            <div style="margin-top: 25px; font-size: 10px; color: #576172; text-align: center;">
                © 2026 BR30 Global Service. Secure Access Guaranteed.
            </div>
        </div>
    </div>
</body>
</html>`;
//#endregion

//#region Forgot Password Template (Sharp & Secure Design)
// 🔥 UPDATED SECURITY TEMPLATE - Laptop & Mobile Sharp Text
const forgotPasswordTemplate = (name, otp) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Web & Laptop Rendering Fix (Laptop par text saaf dikhne ke liye) */
        .email-body { 
            background-color: #000000; 
            padding: 40px 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            -webkit-font-smoothing: antialiased;
            margin: 0; 
        }
        .card { max-width: 500px; margin: auto; background: #0a0a0a; border-radius: 24px; border: 2px solid #ff4d4d; overflow: hidden; box-shadow: 0 0 30px rgba(255, 77, 77, 0.2); }
        .banner { width: 100%; height: auto; display: block; border-bottom: 2px solid #ff4d4d; }
        
        /* Content Styling - Force White on Web */
        .content { padding: 40px 30px; text-align: center; color: #ffffff !important; }
        .security-txt { color: #ff4d4d !important; font-size: 22px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
        
        /* Mobile OTP Box Fix */
        .otp-box { background: rgba(255, 77, 77, 0.05); border: 1px dashed #ff4d4d; border-radius: 16px; padding: 25px; margin: 30px 0; }
        .otp-code { 
            margin: 0; 
            font-size: 35px; 
            letter-spacing: 8px; 
            color: #ff4d4d !important; 
            font-weight: 800; 
            text-shadow: 0 0 15px rgba(255, 77, 77, 0.5); 
            word-break: break-all;
        }
        
        .footer { background: #000000; padding: 30px; text-align: center; border-top: 1px solid #1a1a1a; }
        .security-tag { color: #ff4d4d !important; font-weight: 700; font-size: 14px; }
        .signature { color: #64748b !important; font-size: 13px; line-height: 1.6; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <!-- Security Banner -->
        <img src="https://i.ibb.co/ns0Ww0gg/red-burner-jpg.jpg" alt="Security Banner" class="banner">
        
        <div class="content">
            <div class="security-txt">Password Reset Request</div>
            
            <!-- Pro English & Web Clear Text -->
            <p style="color: #cbd5e1 !important; font-size: 15px; line-height: 1.6;">
                Hi <b>${name}</b>, we received a request to reset your password. Use the secure verification code below to proceed.
            </p>
            
            <div class="otp-box">
                <h1 class="otp-code">${otp}</h1>
            </div>
            
            <p style="color: #ff4d4d !important; font-size: 12px; font-weight: bold;">
                ⚠️ Valid for 5 minutes only.
            </p>
        </div>

        <div class="footer">
            <div class="signature">
                Regards,<br>
                <span class="security-tag">BR30 Support Team</span><br>
                Official Support & Security Division
            </div>

            <!-- OFFICIAL NO-REPLY NOTE -->
            <p style="color: #475569 !important; font-size: 10px; margin-top: 20px; font-style: italic; text-align: center;">
                🚫 <b>Note:</b> This is an automated security email. Please <b>do not reply</b> to this message.
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

           <div style="margin-top: 25px; font-size: 10px; color: #576172; text-align: center;">
                © 2026 BR30 Global Service. Secure Access Guaranteed.
            </div>
        </div>
    </div>
</body>
</html>`;
//#endregion

//#region User Register Function & Email Templates
// ==========================================
// 🚀 2. CONTROLLER FUNCTIONS
// ==========================================

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email/Pass missing!" });

    const isMaster = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
    const assignedRole = isMaster ? "admin" : "student";

    // OTP & Hashing
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = await User.findOne({ email });
    if (user && user.isVerified)
      return res.status(400).json({ msg: "Already verified." });

    if (user) {
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.role = assignedRole;
      user.otpExpires = Date.now() + 600000;
    } else {
      user = new User({
        name,
        email,
        password: hashedPassword,
        otp,
        role: assignedRole,
        otpExpires: Date.now() + 600000,
      });
    }

     // 🔥 DYNAMIC BRANDING & TEMPLATE (Tera Purana Logic)
    const brand = isMaster ? "BR30 Admin" : "BR30 Support";
    const html = isMaster ? adminTemplate(name, otp) : userTemplate(name, otp);

    // ✅ NAYA RESEND API CALL (Ndm ki jagah)
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev', // Abhi testing ke liye yahi rehne do
        to: email,
        subject: `🔐 OTP: ${otp} (${brand})`,
        html: html, // Tera dynamic template yahan safe hai
      });

      await user.save();
      res.status(201).json({ msg: "OTP Sent!" });

    } catch (sendError) {
      console.error("❌ Resend Error:", sendError);
      return res.status(500).json({ error: "Email bhejane mein problem aayi hai." });
    }

  } catch (err) {
    // Ye main try-catch ka end hai
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid/Expired OTP!" });

    // 1. Account Verify Logic
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 2. Welcome Email Logic (Yahan bhi Resend use hoga)
    const welcomeHTML = `// Tera welcome template
    
    // ... Baki logic

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Cyber Neon Glow Theme */
        .email-body { background-color: #000000; padding: 40px 20px; font-family: sans-serif; margin: 0; }
        .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(0, 255, 136, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.15); }
        .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
        .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
        .alert-title { color: #00ff88 !important; font-size: 26px; font-weight: 900; text-shadow: 0 0 15px rgba(0, 255, 136, 0.6); letter-spacing: 3px; text-transform: uppercase; margin: 0; }
        .message-box { background: linear-gradient(145deg, rgba(0,255,136,0.05), rgba(0,0,0,1)); border-left: 5px solid #00ff88; padding: 25px; border-radius: 15px; box-shadow: inset 0 0 15px rgba(0,255,136,0.05); line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0; }
        .login-btn { display: inline-block; padding: 15px 35px; background: #00ff88; color: #000000 !important; font-weight: 900; font-size: 16px; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4); margin-top: 10px; }
        .footer { background: #000000; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
        .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; text-shadow: 0 0 5px #00ff88; letter-spacing: 1px; }
        .module-card { background: #0a0a0a; padding: 20px; border-radius: 15px; margin-bottom: 20px; border-left: 4px solid #00ff88; }
        .module-card h2 { color: #00ff88; font-size: 18px; margin-bottom: 10px; }
        .module-card ul { list-style: none; padding-left: 0; }
        .module-card li { margin-bottom: 8px; color: #e2e8f0; font-size: 14px; display: flex; align-items: center; }
        .module-card svg { width: 16px; height: 16px; margin-right: 6px; stroke: #00ff88; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Official" class="banner">
        <div class="content">
            <h1 class="alert-title">📢 ACCESS GRANTED</h1>
            <h3 style="color: #ffffff !important; font-size: 20px; margin-top: 25px; margin-bottom: 10px;">
                Welcome to BR30ᴛʀᴀᴅᴇʀ VIP! 🚀
            </h3>

            <!-- Main Message -->
            <div class="message-box">
                Hi <b>${user.name}</b>,<br><br>
                Aapka account successfully verify ho gaya hai! Ab aap login karke apni **VIP trading journey** shuru kar sakte hain. 📈<br><br>
                💰 <b>Current Offer For You:</b> ${coupon.code} — Save <b>${coupon.discount}%</b> today! 🏷️
            </div>

            <!-- Enroll Now Button -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://my-frontend-eight-roan.vercel.app/index.html#coursesection" class="login-btn">Enroll Now / Course Buy</a>
            </div>

            <!-- VIP Facilities -->
            <div style="margin-top: 35px;">
                <div class="module-card">
                    <h2>1. Instant Onboarding</h2>
                    <ul>
                       <li>रजिस्ट्रेशन के साथ ही सभी महत्वपूर्ण जानकारी (A-Z) आपके ईमेल पर सीधे भेजी जाएगी।</li>
                       <li>Login credentials और सेटअप गाइड सुरक्षित रूप से उपलब्ध कराए जाएंगे।</li>
                    </ul>
                </div>
                <div class="module-card">
                    <h2>2. Certification</h2>
                    <ul>
                        <li>कोर्स पूरा होने पर Professional Certificate।</li>
                        <li>आपकी मेहनत का डिजिटल प्रमाण।</li>
                    </ul>
                </div>
                <div class="module-card">
                    <h2>3. Ever-Evolving Content</h2>
                    <ul>
                        <li>मार्केट स्ट्रक्चर के हिसाब से हर साल न्यू अपडेट्स।</li>
                        <li>लाइफ टाइम तक लेटेस्ट स्ट्रेटेजीज़ का एक्सेस।</li>
                    </ul>
                </div>
                <div class="module-card">
                    <h2>4. VIP Community</h2>
                    <ul>
                        <li>एक्सक्लूसिव VIP Telegram चैनल में एंट्री।</li>
                        <li>Daily Live Market support और चर्चा।</li>
                    </ul>
                </div>
                <div class="module-card">
                    <h2>5. Direct Support</h2>
                    <ul>
                        <li>Personal Doubt Clearing Sessions।</li>
                        <li>महीने में एक बार VIP-Only Q&A वेबिनार।</li>
                    </ul>
                </div>
                <div class="module-card">
                    <h2>6. Premium Resources</h2>
                    <ul>
                        <li>Trading Rulebook (PDF)</li>
                        <li>High-Probability Chart Layouts</li>
                        <li>Daily Checklist for Discipline</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
                Regards,<br>
                <span class="admin-tag">BR30 Support Team</span><br>
                Official Support & Security Division
            </div>
            <p style="color: #65748a; font-size: 10px; margin-top: 15px; font-style: italic; letter-spacing: 1px;">
                🚫 <b>OFFICIAL NOTE:</b> This is an automated broadcast. Please <b>do not reply</b> to this email.
            </p>

            <!-- Social Links -->
            <div style="margin-top:25px;padding-top:20px;border-top:1px solid #111;">
                <p style="color:#00ff88;font-size:11px;letter-spacing:2px;">JOIN OUR COMMUNITY 🚀</p>
                <a href="https://www.youtube.com" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://www.instagram.com" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://t.me" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://chat.whatsapp.com" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22" style="margin:0 5px;">
                </a>
            </div>
            <div style="margin-top: 25px; font-size: 10px; color: #576172; text-align: center;">
                © 2026 BR30 Global Service. Secure Access Guaranteed.
            </div>
        </div>
    </div>
</body>
</html>`;

    // Email Config
      // ✅ 2. Welcome Email using Resend (Ndm ki jagah)
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev', // Testing ke liye yahi rakho
        to: user.email,
        subject: "Welcome to the Family! 🚀",
        html: welcomeHTML, // Tera purana welcome template
      });
      console.log("Welcome Email Sent! ✅");
    } catch (e) {
      console.log("Mail error: ", e.message);
    }

    // 3. Final Response (Same as your old code)
    res.json({ msg: "Account verified! ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//#endregion

//#region User Login & Forgot Password Functions
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. User ko database mein dhoondo
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Register first." });

    // 🔥 2. Sabse Pehle BLOCK CHECK Karo (Password se bhi pehle)
    if (user.isBlocked === true) {
      return res.status(403).json({
        success: false,
        msg: "🚫 Your account has been suspended. Please contact the Support Team for assistance.",
      });
    }

    // 3. Admin Auto-Role Logic (Jo pehle se tha)
    if (user.email === MASTER_ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    // 4. Password Match Check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong Password." });

    // 5. Email Verification Check
    if (!user.isVerified)
      return res.status(401).json({ msg: "Verify email first." });

    // 6. Token Generate Karo
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "test_secret",
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 2. UPDATED FORGOT PASSWORD FUNCTION ---
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Email not found!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 300000; // 5 Minutes
    await user.save();

    const isMaster = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
    const emailUser = isMaster
      ? process.env.ADMIN_EMAIL_USER
      : process.env.SUPPORT_EMAIL_USER;
    const emailPass = isMaster
      ? process.env.ADMIN_EMAIL_PASS
      : process.env.SUPPORT_EMAIL_PASS;

    // 🔥 DYNAMIC TEMPLATE: Admin ke liye Gold/Red, User ke liye Security Red
    // 🔥 DYNAMIC TEMPLATE (Tera Purana Logic)
    const html = isMaster
      ? adminTemplate(user.name, otp)
      : forgotPasswordTemplate(user.name, otp); 

    // ✅ NAYA RESEND API CALL (Ndm aur Transporter ki chutti)
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev', // Testing ke liye fix rakho
        to: email,
        subject: `🔐 Security Alert: Reset OTP is ${otp}`,
        html: html, // Tera final design safe hai
      });

      console.log("✅ Security Email sent successfully via Resend");
      res.json({ msg: "Reset OTP sent to your email!" });

    } catch (sendError) {
      console.error("❌ Resend API Error:", sendError);
      return res.status(500).json({ error: "Email server block hai, API check karein." });
    }

  } catch (err) {
    console.error("🔥 OTP Error Details:", err); 
    res.status(500).json({ error: err.message });
  }
};

//#endregion

//#region PROFILE MANAGEMENT FUNCTIONS
// ==========================================
// 🚀 PROFILE MANAGEMENT FUNCTIONS
// ==========================================

// 1. GET PROFILE (Profile Data Fetch Karne ke Liye)
exports.getProfile = async (req, res) => {
  try {
    // req.user.id auth middleware se aa rahi hai
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User nahi mila!" });

    res.json(user);
  } catch (err) {
    console.error("Get Profile Error:", err.message);
    res
      .status(500)
      .json({ error: "Server Error: Profile fetch nahi ho payi." });
  }
};

// 2. UPDATE PROFILE (Name Edit aur Photo Upload)
exports.updateProfile = async (req, res) => {
  try {
    console.log("🚀 Incoming File Data:", req.file);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "❌ User nahi mila! (msr pro)" });
    }

    // 1. Name update logic
    user.name = req.body.name || user.name;

    // 2. Agar Cloudinary par nayi file upload hui hai
    if (req.file) {
      // Cloudinary ka direct URL 'req.file.path' mein hota hai
      user.profilePic = req.file.path; 
      console.log("✅ Nayi Cloudinary URL DB mein save ho gayi:", req.file.path);
    }

    const updatedUser = await user.save();

    // 3. Frontend ko Success Response bhejo
    res.json({
      success: true,
      message: "🎉 Profile Update Ho Gayi Hai! (msr pro)",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic // Pura URL jayega frontend ko
      },
    });

  } catch (err) {
    console.error("❌ Update Error (msr pro):", err.message);
    res.status(500).json({
      success: false,
      message: "❌ Server Error: Profile update fail ho gaya (msr pro)",
    });
  }
};

//#endregion

//#region Reset Password Function (OTP Verify ke Baad Naya Password Set Karne ke Liye)
// 3. RESET PASSWORD (Forgot Password ke Baad Naya Password Set Karne ke Liye)
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ msg: "Invalid ya Expired OTP! ❌" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();
    res.json({ msg: "Password successfully change ho gaya! 🔐" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion