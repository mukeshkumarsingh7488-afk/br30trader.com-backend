//#region EMAIL HELPER (VIP CERTIFICATE)
const { Resend } = require("resend");
const fs = require("fs"); // File read karne ke liye
const resend = new Resend(process.env.RESEND_API_KEY);

/* ---------------- SEND EMAIL CORE ---------------- */
const sendEmail = async (options) => {
  try {
    console.log("Resend API Trigger ho raha hai..."); // Testing ke liye
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: options.email,
      subject: options.subject,
      html: options.message,
    });
    console.log("Email Sent Success:", data);
    return data;
  } catch (error) {
    console.error("Resend Error:", error);
    throw error;
  }
};

/**
 * 📧 VIP CERTIFICATE EMAIL - RESEND VERSION (FULL TEMPLATE RESTORED)
 */
const sendVipCertEmail = async (user, fileName, filePath) => {
  try {
    // 📎 1. Attachment taiyar karo (File ko read karna padega)
    const attachmentContent = fs.readFileSync(filePath);

    // 🚀 2. Resend API se mail bhejo
    await resend.emails.send({
      from: '"BR30 VIP OFFICIAL" <onboarding@resend.dev>', // Testing ke liye onboarding rakho
      to: user.email,
      subject: "🏆 CONGRATULATIONS! YOUR VIP CERTIFICATE IS READY",
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
.email-body { background-color:#000; padding:40px 20px; font-family:sans-serif; margin:0; }
.card { max-width:600px; margin:auto; background:#050505; border-radius:30px; border:1px solid rgba(0,255,136,0.4); box-shadow:0 0 50px rgba(0,255,136,0.15); overflow:hidden; }
.banner { width:100%; display:block; border-bottom:3px solid #00ff88; }
.content { padding:45px 35px; color:#fff !important; }
.title { color:#00ff88; font-size:24px; font-weight:900; text-shadow:0 0 15px rgba(0,255,136,0.6); letter-spacing:2px; text-transform:uppercase; }
.box { background:linear-gradient(145deg, rgba(0,255,136,0.05), #000); border-left:5px solid #00ff88; padding:25px; border-radius:15px; color:#e2e8f0; line-height:1.8; margin-top:20px; }
.btn { display:inline-block; padding:16px 35px; background:#00ff88; color:#000 !important; font-weight:900; border-radius:12px; text-decoration:none; box-shadow:0 0 20px rgba(0,255,136,0.4); margin-top:25px; }
.footer { background:#000; padding:35px; text-align:center; border-top:1px solid #1a1a1a; }
.admin { color:#00ff88; font-weight:800; font-size:16px; text-shadow:0 0 5px #00ff88; }
</style>
</head>
<body class="email-body">
<div class="card">
    <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" class="banner">
    <div class="content">
        <h1 class="title">💎 VIP CERTIFICATE UNLOCKED</h1>
        <h3 style="margin-top:25px; color:#fff;">Priority Member Alert 🚀</h3>
        <div class="box">
            Hi <b>${user.name}</b>,<br><br>
            You have officially achieved <b>VIP Trader Status</b> 🎉<br>
            Your professional certificate has been issued successfully.
        </div>
        <div style="text-align:center;">
            <p style="color:#6c7a8e; font-size:12px;">Certificate is attached to this email.</p>
        </div>
    </div>
          <div class="footer">
            <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
                Regards,<br>
                <span class="admin-tag">BR30 Support Team</span><br>
                Official Support & Security Division
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

               <!-- YouTube -->
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
</html>`,
      attachments: [
        {
          filename: `BR30_Certificate_${user.name}.pdf`,
          content: attachmentContent, // Buffer content pass kar rahe hain
        },
      ],
    });

    console.log(`📩 VIP Certificate Email Sent via Resend to ${user.email}`);
  } catch (error) {
    console.error("❌ Resend Mailer Error:", error.message);
    throw error;
  }
};

/* welcome templet */
const welcomeTemplate = (user, coupon) => {
  // 🎉 WELCOME TEMPLATE (FULL SAFE - NOTHING REMOVED)
  welcome: (user, coupon = {}) => {
    console.log("📩 Welcome Template Triggered:", user?.email);

    return `<!DOCTYPE html>
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
                <!-- YouTube -->
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
            <div style="margin-top: 25px; font-size: 10px; color: #576172; text-align: center;">
                © 2026 BR30 Global Service. Secure Access Guaranteed.
            </div>
        </div>
    </div>
</body>
</html>`;
  };
};
/* user and admin register otp templet */
const otpTemplate = (name, otp, isMaster) => {
  console.log("📩 OTP Template Triggered:", name, isMaster);

  // 👑 ADMIN TEMPLATE
  if (isMaster) {
    return `
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

            <div style="margin-top: 25px; font-size: 10px; color: #576172; text-align: center;">
                © 2026 BR30 Global Service. Secure Access Guaranteed.
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  // 👤 USER TEMPLATE
  return `
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

           <div style="margin-top: 25px; font-size: 10px; color: #576172; text-align: center;">
                © 2026 BR30 Global Service. Secure Access Guaranteed.
            </div>
        </div>
    </div> <!-- Ye Card wala div band ho raha hai -->
</body>
</html>`;
};

/* admin and user reset otp templet */
const forgotOtpTemplate = (name, otp, isMaster) => {
  if (isMaster) {
    return `ADMIN RESET TEMPLATE`;
  }
  // user forgot otp templet
  return `<!DOCTYPE html>
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

           <div style="margin-top: 25px; font-size: 10px; color: #576172; text-align: center;">
                © 2026 BR30 Global Service. Secure Access Guaranteed.
            </div>
        </div>
    </div>
</body>
</html>`;
};

/* Purchase course templet (Vip welcome mail) templet*/
const purchaseTemplate = (name, courseName) => {
  return `
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
            <a href="https://t.me/+F8mDhdfiGaI1NDY1/+hBAT4kWo63A4ZWY1" class="login-btn">JOIN OUR VIP COMMUNITY</a>
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

            <div style="margin-top: 10px; font-size: 10px; color: #9298a3; letter-spacing: 1px;">
                EST. 2024 | SECURE TRADING ENVIRONMENT | © BR30ᴛʀᴀᴅᴇʀ
            </div>
        </div>
    </div>
</body>

</html>
  `;
};

// 🚨 ADMIN ALERT TEMPLATE (Payment Fail)
const paymentFailAdminTemplate = (user, course, reason) => {
  return `
   <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .email-body { background-color: #000000; padding: 40px 20px; font-family: sans-serif; margin: 0; }
        .card { 
            max-width: 600px; margin: auto; background: #050505; border-radius: 20px; 
            border: 1px solid #ff3e3e; overflow: hidden; 
            box-shadow: 0 0 30px rgba(255, 62, 62, 0.1); 
        }
        .header { background: #ff3e3e; color: #ffffff; padding: 15px; text-align: center; font-weight: 900; letter-spacing: 2px; }
        .content { padding: 30px; color: #ffffff !important; }
        
        .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .info-table td { padding: 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; }
        .label { color: #00ff88; font-weight: bold; width: 35%; }
        .value { color: #ffffff; }

        .action-box { 
            background: rgba(0, 255, 136, 0.05); border: 1px dashed #00ff88; 
            padding: 25px; border-radius: 15px; margin-top: 25px; text-align: center;
        }
        
        /* 🔥 NEW QUICK REPLY BUTTON */
        .reply-btn {
            display: inline-block; padding: 12px 25px; background: #00ff88; 
            color: #000000 !important; font-weight: 900; font-size: 14px; 
            text-decoration: none; border-radius: 8px; text-transform: uppercase;
            letter-spacing: 1px; box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
            margin-top: 15px;
        }

        .footer { background: #000000; padding: 20px; text-align: center; color: #444; font-size: 11px; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <div class="header">🚨 INTERNAL ALERT: PAYMENT FAILURE</div>
        
        <div class="content">
            <p style="font-size: 16px;">Bhai, ek user ka payment fail ho gaya hai. Sale close karne ke liye niche button pe click karke turant reply karein!</p>
            
            <table class="info-table">
                <tr>
                    <td class="label">USER NAME:</td>
                    <td class="value">${user.name}</td>
                </tr>
                <tr>
                    <td class="label">USER EMAIL:</td>
                    <td class="value">${user.email}</td>
                </tr>
                <tr>
                    <td class="label">COURSE:</td>
                    <td class="value">${course.title}</td>
                </tr>
                <tr>
                    <td class="label">FAILURE REASON:</td>
                    <td class="value" style="color: #ff3e3e;">${reason || "Technical Issue / Cancelled"}</td>
                </tr>
            </table>

            <div class="action-box">
                <p style="color: #00ff88; margin: 0; font-weight: bold;">DIRECT ACTION PANEL</p>
                
                <!-- 🔥 Mailto Link: User ki email automatically bhar jayegi -->
                <a href="mailto:${user.email}?subject=Regarding your interest in ${course.title}&body=Hi ${user.name}, humne dekha ki aapka payment fail ho gaya hai..." class="reply-btn">
                   📧 SEND EMAIL TO USER
                </a>
                
                <p style="font-size: 12px; margin-top: 10px; color: #64748b;">one click mein user ko email compose karein.</p>
            </div>
        </div>

        <div class="footer">
            BR30 TRADER AUTOMATED SYSTEM v2.5<br>
            Security Division Alert System
        </div>
    </div>
</body>
</html>
  `;
};

// 👤 USER TEMPLATE (Payment Fail Help)
const paymentFailUserTemplate = (user, course, reason) => {
  return `
   <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
.email-body { background-color: #000000; padding: 40px 20px; font-family: sans-serif; margin: 0; }
.card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(0, 255, 136, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.15); }
.banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
.content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
.alert-title { color: #ff3e3e !important; font-size: 22px; font-weight: 900; text-shadow: 0 0 15px rgba(255, 62, 62, 0.4); letter-spacing: 2px; text-transform: uppercase; margin: 0; }
.thanks-note { color: #00ff88 !important; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: block; text-shadow: 0 0 5px rgba(0, 255, 136, 0.3); }
.message-box { background: linear-gradient(145deg, rgba(0, 255, 136, 0.05), rgba(0, 0, 0, 1)); border-left: 5px solid #00ff88; padding: 25px; border-radius: 15px; box-shadow: inset 0 0 15px rgba(0, 255, 136, 0.05); line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0; }
.support-btn { display: inline-block; padding: 15px 35px; background: #00ff88; color: #000000 !important; font-weight: 900; font-size: 16px; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4); margin-top: 10px; }
.footer { background: #000000; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
.admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; text-shadow: 0 0 5px #00ff88; letter-spacing: 1px; }
</style></head>

<body class="email-body">
<div class="card">

<img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Official" class="banner">

<div class="content">
<span class="thanks-note">Hi ${user.name}, Thank you for your interest! 🚀</span>
<h1 class="alert-title">⚠️ PAYMENT NOT COMPLETED</h1>

<h3 style="color: #ffffff !important; font-size: 18px; margin-top: 20px; margin-bottom: 5px;">
Important Order Status Update
</h3>

<div class="message-box">
Sabse pehle, <b>${course.title}</b> mein interest dikhane ke liye bahut-bahut shukriya!
Hum aapko apne saath dekhne ke liye excited hain.<br><br>

Lekin humne dekha ki aapka purchase process poora nahi ho paaya.
Shayad network error ya bank server ki wajah se payment fail ho gaya hai.<br><br>

<span style="color: #ff3e3e;">
<b>Status:</b> ${reason || "Action Required"}
</span><br><br>

Chinta mat kijiye! Humari support team aapki help ke liye taiyar hai taaki aapki learning na ruke.
<b>Abhi contact kare niche diye gaye whatsapp Link pe...</b>
</div>

<div style="text-align: center; margin-top: 30px;">
<a href="https://wa.me/916200986380?text=Hello%20Support%20Team%2C%20mera%20payment%20fail%20ho%20gaya%20hai%2C%20please%20help%20kar%20dijiye." class="support-btn">
TALK TO SUPPORT ON WHATSAPP
</a>
</div>

<p style="color: #94a3b8 !important; font-size: 13px; text-align: center; margin-top: 35px; font-style: italic;">
Humari team 24/7 aapki help ke liye available hai. ✅
</p>
</div>

<!-- ✅ FOOTER START -->
<div class="footer">

<div style="color: #64748b; font-size: 13px; line-height: 1.6;">
Regards,<br>
<span class="admin-tag">BR30 Support Team</span><br>
Official Support & Security Division
</div>

<p style="color: #b1a5a5; font-size: 10px; margin-top: 20px; font-style: italic;">
🚫 <b>Note:</b> Auto-generated alert. Please <b>do not reply</b>.
</p>

<!-- SOCIAL LINKS -->
<div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #111;">
<p style="color: #00ff88; font-size: 11px; letter-spacing: 2px; margin-bottom: 15px;">
JOIN OUR COMMUNITY 🚀
</p>

<a href="https://www.youtube.com" style="margin: 0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22">
</a>

<a href="https://www.instagram.com/br30traderofficial?igsh=MWN5eHBscWY5bXFvMw==" style="margin: 0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
</a>

<a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank">
       <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
       width="17"
       style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
    </a>

<a href="https://t.me/+F8mDhdfiGaI1NDY1" style="margin: 0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
</a>

<a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" style="margin: 0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22">
</a>
</div>

<!-- 🔥 FINAL FOOTER (SOCIAL KE NICHE) -->
<div style="margin-top:20px; color:#64748b; font-size:12px;">
BR30 TRADER AUTOMATED SYSTEM v2.5<br>
Security Division Alert System
</div>

</div>
<!-- ✅ FOOTER END -->

</div>
</body></html>
  `;
};

// 💰 OFFER TEMPLATE (Normal users)
const offerTemplate = ({ discountValue, dynamicCoupon, htmlContent }) => {
  return `
 <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Cyber Neon Glow Upgrade */
        .email-body { background-color: #000000; padding: 40px 20px; font-family: sans-serif; margin: 0; }
        
        .card { 
            max-width: 600px; margin: auto; background: #050505; border-radius: 30px; 
            border: 1px solid rgba(0, 255, 136, 0.4); overflow: hidden; 
            box-shadow: 0 0 50px rgba(0, 255, 136, 0.15); 
        }

        .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
        .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }

        .alert-title { 
            color: #00ff88 !important; font-size: 26px; font-weight: 900; 
            text-shadow: 0 0 15px rgba(0, 255, 136, 0.6); 
            letter-spacing: 3px; text-transform: uppercase; margin: 0;
        }

        /* 🏷️ DYNAMIC DISCOUNT BOX */
        .discount-box { 
            background: linear-gradient(145deg, rgba(0,255,136,0.08), rgba(0,0,0,1));
            border: 2px dashed #00ff88; padding: 30px; border-radius: 20px; 
            text-align: center; margin: 25px 0;
        }

        .coupon-code {
            background: #00ff88; color: #000000 !important; font-size: 32px; 
            font-weight: 900; padding: 10px 20px; border-radius: 12px;
            display: inline-block; margin: 15px 0; letter-spacing: 4px;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
        }

        .login-btn {
            display: inline-block; padding: 15px 35px; background: #00ff88; 
            color: #000000 !important; font-weight: 900; font-size: 16px; 
            text-decoration: none; border-radius: 12px; text-transform: uppercase;
            letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
            margin-top: 10px;
        }

        .footer { background: #000000; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
        
        .admin-tag { 
            color: #00ff88 !important; font-weight: 800; font-size: 16px; 
            text-shadow: 0 0 5px #00ff88; letter-spacing: 1px;
        }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Official" class="banner">
        
        <div class="content">
            <h1 class="alert-title">📢 SPECIAL OFFER</h1>
            
            <h3 style="color: #ffffff !important; font-size: 20px; margin-top: 25px; margin-bottom: 10px;">
                Exclusive Trader Discount! 🚀
            </h3>
            
            <div class="discount-box">
                <p style="color: #00ff88; font-size: 16px; margin: 0; font-weight: bold;">
                    Aapke liye special <b>${discountValue}% DISCOUNT</b> code:
                </p>
                <div class="coupon-code">${dynamicCoupon}</div>
                <p style="color: #ff4d4d; font-size: 12px; font-weight: bold; margin-top: 10px;">
                    ⚠️ VALID FOR 7 DAYS ONLY!
                </p>
            </div>

            <div style="line-height: 1.8; color: #e2e8f0; font-size: 16px; margin-bottom: 25px;">
                ${htmlContent || "Hi Trader, humne dekha ki aapne abhi tak premium access join nahi kiya hai. Is khas mauke ka faida uthayein aur apni journey shuru karein."}
            </div>

            <div style="text-align: center; margin-top: 30px;">
               <a href="https://my-frontend-eight-roan.vercel.app/index.html#coursesection" class="login-btn">REDEEM & SAVE ${discountValue}%</a>
            </div>
            
            <p style="color: #94a3b8 !important; font-size: 14px; text-align: center; margin-top: 35px; font-style: italic;">
                <b>Official Member:</b> Personalized Trading Offer Applied. ✅
            </p>
        </div>

        <div class="footer">
            <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
                Regards,<br>
                <span class="admin-tag">BR30 Support Team</span><br>
                Official Support & Security Division
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

               <!-- YouTube -->
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
</html>
  `;
};

// 💎 VIP TEMPLATE
const vipTemplate = ({ discountValue, dynamicCoupon, htmlContent }) => {
  return `
  <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .email-body { background-color: #000000; padding: 40px 20px; font-family: sans-serif; margin: 0; }
        .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 2px solid #00ff88; overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.2); }
        .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
        .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
        .alert-title { color: #00ff88 !important; font-size: 24px; font-weight: 900; text-shadow: 0 0 15px rgba(0, 255, 136, 0.6); letter-spacing: 3px; text-transform: uppercase; margin: 0; }
        
        /* 💎 VIP UPDATE BOX */
        .vip-box { 
            background: linear-gradient(145deg, rgba(0,255,136,0.1), rgba(0,0,0,1));
            border-left: 5px solid #00ff88; padding: 25px; border-radius: 15px; 
            line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0;
        }

        .telegram-btn {
            display: inline-block; padding: 15px 35px; background: #00ff88; 
            color: #000000 !important; font-weight: 900; font-size: 15px; 
            text-decoration: none; border-radius: 12px; text-transform: uppercase;
            letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
            margin-top: 10px;
        }

        .footer { background: #000000; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
        .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; text-shadow: 0 0 5px #00ff88; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 VIP Official" class="banner">
        
        <div class="content">
            <h1 class="alert-title">💎 VIP PRIVATE UPDATE</h1>
            
            <h3 style="color: #ffffff !important; font-size: 20px; margin-top: 25px; margin-bottom: 10px;">
                Priority Member Alert! 🚀
            </h3>
            
            <div class="vip-box">
                Hi VIP Trader, aap hamari premium community ke top member hain. Aapke liye ek naya **Course/Update** live ho gaya hai!<br><br>
                <span style="color: #00ff88; font-weight: bold;">
                    📣 Update: ${htmlContent || "Naya exclusive strategy video upload ho gaya hai. Abhi check karein!"}
                </span>
            </div>
           <p style="color: #e2e8f0; font-size: 15px; margin-bottom: 20px;">
             Aap hamare <b>Priority Circle</b> mein hain. Naya content aur market strategies sabse pehle aapke dashboard par update kar di gayi hain:
            </p>

            <div style="text-align: center; margin-top: 20px;">
             <!-- Dashboard par bhejo taaki wo naya course dekh sake -->
              <a href="https://t.me/+F8mDhdfiGaI1NDY1/+hBAT4kWo63A4ZWY1" class="telegram-btn">CHECK NEW UPDATE NOW</a>
             </div>

              <p style="color: #00ff88; font-size: 12px; text-align: center; margin-top: 15px; font-weight: bold; letter-spacing: 1px;">
             🚀 VIP SUPPORT: DIRECT ACCESS ENABLED
            </p>
            
            <p style="color: #94a3b8 !important; font-size: 13px; text-align: center; margin-top: 40px; font-style: italic;">
                <b>Exclusive Access:</b> VIP Benefits Active for your Account. ✅
            </p>
        </div>

        <div class="footer">
            <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
                Regards,<br>
                <span class="admin-tag">BR30 Support Team</span><br>
                VIP Support & Strategy Division
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
             <!-- YouTube -->
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
</html>
  `;
};

// Official email templet
const getAnnouncementHTML = (subject, message) => {
  return `
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
};
module.exports = {
  sendEmail,
  sendVipCertEmail,
  welcomeTemplate,
  otpTemplate,
  forgotOtpTemplate,
  purchaseTemplate,
  paymentFailAdminTemplate,
  paymentFailUserTemplate,
  offerTemplate,
  vipTemplate,
  getAnnouncementHTML,
};
//#endregion
