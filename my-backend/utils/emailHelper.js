//#region EMAIL HELPER (VIP CERTIFICATE)
const { Resend } = require('resend');
const fs = require('fs'); // File read karne ke liye
const resend = new Resend(process.env.RESEND_API_KEY);

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

module.exports = { sendVipCertEmail };
//#endregion
