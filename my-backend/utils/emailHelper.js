//#region EMAIL HELPER
// Ye helper function humare email sending ke liye hai. Isme hum nodemailer ka use karke VIP certificate generate hone par user ko ek professional email bhejenge, jisme unka certificate download karne ka link hoga. 
// Jab bhi koi user VIP certificate earn karega, toh yeh function call hoke usko ek congratulatory email bhejega, jisme unka naam personalize hoke dikhai dega, aur unko apna certificate download karne ka option milega.
const nodemailer = require("nodemailer");

/**
 * 📧 VIP CERTIFICATE EMAIL - FINAL UPGRADED (FULL TEMPLATE RESTORED)
 */
const sendVipCertEmail = async (user, fileName, filePath) => {
  try {
    // ⚙️ 1. Transporter setup (Gmail service use ho rahi hai)
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SEND_EMAIL_USER, // .env se email uthao
        pass: process.env.SEND_EMAIL_PASS, // .env se 16-digit App Password uthao
      },
    });

    // 📝 2. Mail Options (Aapka Pura Template)
    const mailOptions = {
      from: '"BR30 VIP OFFICIAL" <br30service.contact@gmail.com>',
      to: user.email,
      subject: "🏆 CONGRATULATIONS! YOUR VIP CERTIFICATE IS READY",
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
.email-body { background-color:#000; padding:40px 20px; font-family:sans-serif; margin:0; }
.card {
    max-width:600px; margin:auto; background:#050505; border-radius:30px;
    border:1px solid rgba(0,255,136,0.4);
    box-shadow:0 0 50px rgba(0,255,136,0.15);
    overflow:hidden;
}
.banner { width:100%; display:block; border-bottom:3px solid #00ff88; }
.content { padding:45px 35px; color:#fff !important; }
.title {
    color:#00ff88; font-size:24px; font-weight:900;
    text-shadow:0 0 15px rgba(0,255,136,0.6);
    letter-spacing:2px; text-transform:uppercase;
}
.box {
    background:linear-gradient(145deg, rgba(0,255,136,0.05), #000);
    border-left:5px solid #00ff88;
    padding:25px; border-radius:15px;
    color:#e2e8f0; line-height:1.8;
    margin-top:20px;
}
.btn {
    display:inline-block;
    padding:16px 35px;
    background:#00ff88;
    color:#000 !important;
    font-weight:900;
    border-radius:12px;
    text-decoration:none;
    box-shadow:0 0 20px rgba(0,255,136,0.4);
    margin-top:25px;
}
.footer {
    background:#000;
    padding:35px;
    text-align:center;
    border-top:1px solid #1a1a1a;
}
.admin {
    color:#00ff88;
    font-weight:800;
    font-size:16px;
    text-shadow:0 0 5px #00ff88;
}
</style>
</head>

<body class="email-body">
<div class="card">
    <!-- 🔥 Burner Banner -->
    <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" class="banner">

    <div class="content">
        <h1 class="title">💎 VIP CERTIFICATE UNLOCKED</h1>
        <h3 style="margin-top:25px; color:#fff;">Priority Member Alert 🚀</h3>

        <div class="box">
            Hi <b>${user.name}</b>,<br><br>
            You have officially achieved <b>VIP Trader Status</b> 🎉<br>
            Your professional certificate has been issued successfully.<br><br>
            Click below to download and verify your certificate.
        </div>

        <div style="text-align:center;">
            <a href="http://localhost:5000/certificates/${fileName}" class="btn">
                DOWNLOAD & VERIFY
            </a>
        </div>
    </div>

    <!-- 🔻 Footer -->
    <div class="footer">
        <div style="color:#94a3b8;font-size:13px;">
            Regards,<br>
            <span class="admin">MUKESH KS.</span><br>
            BR30 TRADER ACADEMY FOUNDER
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
</html>
`,
      // 📎 3. ATTACHMENT: Ye PDF file mail ke saath jayegi
      attachments: [
        {
          filename: `BR30_Certificate_${user.name}.pdf`,
          path: filePath,
        },
      ],
    };

    // 🚀 4. Mail bhejo
    await transporter.sendMail(mailOptions);
    console.log(`📩 VIP Certificate Email Sent to ${user.email}`);
  } catch (error) {
    // ❌ Error Handling
    console.error("❌ Mailer Error:", error.message);
    throw error;
  }
};

module.exports = { sendVipCertEmail };
//#endregion