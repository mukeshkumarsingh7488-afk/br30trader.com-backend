//#region ━━━━━ 🚀 WELCOME DEVELOPER | SYSTEM INITIALIZED ━━━━━
const axios = require("axios");
const { Resend } = require("resend");
const fs = require("fs"); // File read karne ke liye
const resend = new Resend(process.env.RESEND_API_KEY);

/* ---------------- SEND EMAIL CORE ---------------- */
const sendEmail = async (options = {}) => {
  try {
    if (!process.env.BREVO_EMAIL || !process.env.BREVO_SMTP_KEY) {
      throw new Error("Brevo configuration missing");
    }

    const normalizeEmails = (input) => {
      if (!input) return [];

      const rawList = Array.isArray(input) ? input : String(input).split(",");

      return rawList
        .flatMap((item) => {
          if (!item) return [];

          if (typeof item === "string") {
            return item.split(",").map((email) => ({ email: email.trim() }));
          }

          if (typeof item === "object" && item.email) {
            return [{ email: String(item.email).trim(), name: item.name ? String(item.name).trim() : undefined }];
          }

          return [];
        })
        .filter((item) => item.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email))
        .filter((item, index, self) => index === self.findIndex((x) => x.email.toLowerCase() === item.email.toLowerCase()));
    };

    const toList = normalizeEmails(options.to || options.email);
    const ccList = normalizeEmails(options.cc);
    const bccList = normalizeEmails(options.bcc);

    if (!toList.length && !ccList.length && !bccList.length) {
      throw new Error("Recipient email is required");
    }

    const emailHtmlContent = options.html || options.message || "";
    const emailSubject = options.subject || "No Subject";

    const payload = {
      sender: {
        name: options.senderName || "BR30 Trader",
        email: process.env.BREVO_EMAIL.trim(),
      },
      subject: emailSubject,
      htmlContent: emailHtmlContent,
    };

    if (toList.length) payload.to = toList;
    if (ccList.length) payload.cc = ccList;
    if (bccList.length) payload.bcc = bccList;

    const replyToList = normalizeEmails(options.replyTo);
    if (replyToList.length) payload.replyTo = replyToList[0];

    console.log("📧 Dispatching Live BR30Trader Brevo API:", {
      to: toList.map((x) => x.email),
      cc: ccList.map((x) => x.email),
      bcc: bccList.map((x) => x.email),
      subject: emailSubject,
    });

    const brevoResponse = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_SMTP_KEY.trim(),
        "content-type": "application/json",
      },
    });

    if (brevoResponse.status === 200 || brevoResponse.status === 201) {
      console.log("✅ Dynamic Email Sent Successfully via Brevo API");
      return brevoResponse.data;
    }

    throw new Error("Brevo API rejected the email request");
  } catch (error) {
    console.error("❌ Live Brevo API Transaction Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Email sending failed");
  }
};

/**
 * 📧 VIP CERTIFICATE EMAIL - RESEND VERSION (FULL TEMPLATE RESTORED)
 */
const sendVipCertEmail = async (user, fileName, filePath) => {
  try {
    const attachmentContent = fs.readFileSync(filePath);

    await sendEmail({
      from: process.env.BREVO_EMAIL,
      replyTo: {
        email: "support.br30trader@gmail.com",
        name: "BR30 Support Team",
      },
      to: user.email,
      subject: "🏆 CONGRATULATIONS! YOUR VIP CERTIFICATE IS READY",
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>BR30 VIP Certificate</title>

<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:0;margin:0;}
.card{max-width:620px;margin:auto;background:#050505;border-radius:30px;border:1px solid rgba(0,255,136,.35);overflow:hidden;box-shadow:0 0 50px rgba(0,255,136,.12);}
.banner{width:100%;display:block;height:auto;border-bottom:3px solid #00ff88;}
.content{padding:45px 35px;color:#ffffff!important;}
.title{margin:0;color:#00ff88;font-size:26px;font-weight:900;letter-spacing:2px;text-transform:uppercase;text-shadow:0 0 18px rgba(0,255,136,.55);}
.box{margin-top:24px;padding:28px;background:linear-gradient(145deg,rgba(0,255,136,.06),#000000);border-left:5px solid #00ff88;border-radius:18px;color:#e2e8f0;line-height:1.9;font-size:15px;box-shadow:0 0 20px rgba(0,255,136,.08);}
.footer{background:#000000;padding:40px 30px 35px 30px;text-align:center;border-top:1px solid #111;}
</style>
</head>

<body class="email-body">

<div class="card">

<img src="https://res.cloudinary.com/dw4imlekm/image/upload/v1779141465/Green_burner_qc5lon.jpg" class="banner">

<div class="content">

<h1 class="title">💎 VIP CERTIFICATE UNLOCKED</h1>

<h3 style="margin:25px 0 0 0;color:#ffffff;font-size:21px;font-weight:800;letter-spacing:.5px;">
Priority Member Alert 🚀
</h3>

<div class="box">
Hi <b>${user.name}</b>,<br><br>

You have officially achieved <b style="color:#00ff88;">VIP Trader Status</b> 🎉<br>

Your professional certificate has been successfully generated and verified by the BR30 Master System.<br><br>

Welcome to the premium circle of BR30ᴛʀᴀᴅᴇʀ.
</div>

<div style="text-align:center;margin-top:20px;">
<p style="color:#94a3b8;font-size:12px;line-height:1.8;letter-spacing:.5px;">
Your VIP certificate PDF has been securely attached to this email.<br>
Please download and keep it safe for future verification.
</p>
</div>

</div>

<div class="footer" style="background:#000000;padding:40px 30px 35px 30px;text-align:center;border-top:1px solid #111;">

<!-- BRAND -->
<div style="margin-bottom:18px;">

<div style="color:#ffffff;font-size:18px;font-weight:900;letter-spacing:2px;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.3);">
BR30 SUPPORT TEAM
</div>

<div style="margin-top:8px;color:#00ff88;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
Official Support & Security Division
</div>

<div style="margin-top:12px;color:#64748b;font-size:13px;line-height:1.8;">
Thank you for being part of the BR30 ecosystem.<br>
We are committed to delivering secure, professional & lifetime trading support.
</div>

</div>

<!-- NOTICE -->
<div style="margin-top:22px;padding:14px 18px;background:rgba(0,255,136,.05);border:1px solid rgba(0,255,136,.15);border-radius:12px;">

<p style="margin:0;color:#b8c2d1;font-size:10px;line-height:1.8;letter-spacing:1px;font-style:italic;">

🚫 <span style="color:#ff4d4d;font-weight:900;">OFFICIAL NOTICE:</span>

This is an automated security broadcast generated by the BR30 Master Infrastructure System.

Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.

</p>

</div>

<!-- VERIFIED -->
<p style="color:#00ff88!important;font-size:11px;margin-top:22px;font-weight:900;letter-spacing:2px;text-shadow:0 0 10px rgba(0,255,136,.35);">
🛡️ VIP CHANNEL VERIFIED
</p>

<!-- SOCIAL -->
<div style="margin-top:30px;padding-top:25px;border-top:1px solid #111;">

<p style="color:#00ff88;font-size:11px;font-weight:800;letter-spacing:3px;margin-bottom:22px;text-transform:uppercase;">
Stay Connected With BR30 🚀
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">
<tr>

<td style="padding:0 6px;">
<a href="https://www.youtube.com/@br30traderofficial" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://www.instagram.com/br30Traderofficial" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://x.com/MukeshKuma48159" target="_blank">
<img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="24" height="24" style="display:block;border:0;background:#000;border-radius:50%;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://www.threads.com/@br30traderofficial" target="_blank">
<img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="24" height="24" style="display:block;border:0;background:#000;border-radius:50%;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

</tr>
</table>

</div>

<!-- BOTTOM -->
<div style="margin-top:28px;padding-top:18px;border-top:1px solid rgba(255,255,255,.05);">

<div style="color:#9ca3af;font-size:10px;letter-spacing:2px;line-height:1.9;text-transform:uppercase;">
EST. 2026 | Secure Trading Infrastructure | BR30 Master System
</div>

<div style="margin-top:8px;color:#4b5563;font-size:9px;letter-spacing:1.2px;">
© BR30ᴛʀᴀᴅᴇʀ • All Rights Reserved
</div>

<div style="margin-top:10px;color:#374151;font-size:8px;letter-spacing:1px;">
SYSTEM SESSION VERIFIED • ENCRYPTED MAIL CHANNEL ACTIVE
</div>

</div>

<!-- GMAIL ANTI COLLAPSE -->
<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">
VIP-CERT-${Date.now()}-${user.email}
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
  console.log("📩 Welcome Template Triggered:", user?.email);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:0;margin:0;}
.card{max-width:620px;margin:auto;background:#050505;border-radius:30px;border:1px solid rgba(0,255,136,.4);overflow:hidden;box-shadow:0 0 50px rgba(0,255,136,.15);}
.banner{width:100%;display:block;height:auto;border-bottom:3px solid #00ff88;}
.content{padding:45px 35px;text-align:left;color:#ffffff!important;}
.alert-title{color:#00ff88!important;font-size:26px;font-weight:900;text-shadow:0 0 15px rgba(0,255,136,.6);letter-spacing:3px;text-transform:uppercase;margin:0;}
.message-box{background:linear-gradient(145deg,rgba(0,255,136,.05),#000);border-left:5px solid #00ff88;padding:25px;border-radius:15px;box-shadow:inset 0 0 15px rgba(0,255,136,.05);line-height:1.8;color:#e2e8f0!important;font-size:16px;margin:25px 0;}
.login-btn{display:inline-block;padding:15px 35px;background:#00ff88;color:#000000!important;font-weight:900;font-size:16px;text-decoration:none;border-radius:12px;text-transform:uppercase;letter-spacing:1px;box-shadow:0 0 20px rgba(0,255,136,.4);margin-top:10px;}
.footer{background:#000000;padding:35px;text-align:center;border-top:1px solid #1a1a1a;}
.admin-tag{color:#00ff88!important;font-weight:800;font-size:16px;text-shadow:0 0 5px #00ff88;letter-spacing:1px;}
.module-card{background:#0a0a0a;padding:20px;border-radius:15px;margin-bottom:20px;border-left:4px solid #00ff88;}
.module-card h2{color:#00ff88;font-size:18px;margin:0 0 10px 0;}
.module-card ul{list-style:none;padding-left:0;margin:0;}
.module-card li{margin-bottom:8px;color:#e2e8f0;font-size:14px;line-height:1.7;}
</style>
</head>

<body class="email-body">
<div class="card">

<img src="https://res.cloudinary.com/dw4imlekm/image/upload/v1779141465/Green_burner_qc5lon.jpg" alt="BR30 Official" class="banner">

<div class="content">
<h1 class="alert-title">📢 ACCESS GRANTED</h1>

<h3 style="color:#ffffff!important;font-size:20px;margin-top:25px;margin-bottom:10px;">
Welcome to BR30ᴛʀᴀᴅᴇʀ VIP! 🚀
</h3>

<div class="message-box">
Hi <b>${user.name}</b>,<br><br>
Your account has been successfully verified! 🎉<br>
You can now log in and begin your professional VIP trading journey with BR30ᴛʀᴀᴅᴇʀ. 📈<br><br>
💰 <b>Exclusive Welcome Offer:</b> Use coupon <b style="color:#00ff88;">${coupon.code}</b> and save <b style="color:#00ff88;">${coupon.discount}%</b> today! 🏷️
</div>

<div style="text-align:center;margin-top:30px;">
<a href="https://my-frontend-eight-roan.vercel.app/?scroll=coursesection" class="login-btn">Enroll Now</a>
</div>

<div style="margin-top:35px;">

<div class="module-card">
<h2>1. Instant Onboarding</h2>
<ul>
<li>✅ All essential A-Z onboarding details will be delivered directly to your email after registration.</li>
<li>✅ Your login credentials and setup guide will be shared securely.</li>
</ul>
</div>

<div class="module-card">
<h2>2. Professional Certification</h2>
<ul>
<li>✅ Receive a professional trading certificate after completing the course.</li>
<li>✅ A digital recognition of your learning journey, discipline, and dedication.</li>
</ul>
</div>

<div class="module-card">
<h2>3. Ever-Evolving Content</h2>
<ul>
<li>✅ Course content is upgraded every year according to changing market conditions.</li>
<li>✅ Get lifetime access to the latest strategies, concepts, and improvements.</li>
</ul>
</div>

<div class="module-card">
<h2>4. VIP Community Access</h2>
<ul>
<li>✅ Exclusive entry into the BR30 VIP Telegram community.</li>
<li>✅ Daily live market discussions, insights, and premium community support.</li>
</ul>
</div>

<div class="module-card">
<h2>5. Direct Expert Support</h2>
<ul>
<li>✅ Personal doubt-clearing support for better learning and execution.</li>
<li>✅ Monthly VIP-only Q&A webinars with advanced market guidance.</li>
</ul>
</div>

<div class="module-card">
<h2>6. Premium Resources</h2>
<ul>
<li>✅ Professional Trading Rulebook PDF</li>
<li>✅ High-Probability Chart Layouts</li>
<li>✅ Daily Discipline & Execution Checklist</li>
</ul>
</div>

</div>
</div>

<div class="footer" style="background:#000;padding:40px 30px 35px 30px;text-align:center;border-top:1px solid #111;">

<div style="margin-bottom:18px;">
<div style="color:#ffffff;font-size:18px;font-weight:900;letter-spacing:2px;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.3);">BR30 SUPPORT TEAM</div>
<div style="margin-top:8px;color:#00ff88;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Official Support & Security Division</div>
<div style="margin-top:12px;color:#64748b;font-size:13px;line-height:1.8;">Thank you for being part of the BR30 ecosystem.<br>We are committed to delivering secure, professional & lifetime trading support.</div>
</div>

<div style="margin-top:22px;padding:14px 18px;background:rgba(0,255,136,.05);border:1px solid rgba(0,255,136,.15);border-radius:12px;">
<p style="margin:0;color:#b8c2d1;font-size:10px;line-height:1.8;letter-spacing:1px;font-style:italic;">
🚫 <span style="color:#ff4d4d;font-weight:900;">OFFICIAL NOTICE:</span> This is an automated security broadcast generated by the BR30 Master System. Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.
</p>
</div>

<div style="margin-top:30px;padding-top:25px;border-top:1px solid #111;">
<p style="color:#00ff88;font-size:11px;font-weight:800;letter-spacing:3px;margin-bottom:22px;text-transform:uppercase;">STAY CONNECTED WITH BR30 🚀</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">
<tr>
<td style="padding:0 6px;"><a href="https://www.youtube.com/@br30traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="24" height="24" style="display:block;border:0;"></a></td>
<td style="padding:0 6px;"><a href="https://www.instagram.com/br30Traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" height="24" style="display:block;border:0;"></a></td>
<td style="padding:0 6px;"><a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" height="24" style="display:block;border:0;"></a></td>
<td style="padding:0 6px;"><a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="24" height="24" style="display:block;border:0;"></a></td>
<td style="padding:0 6px;"><a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="24" height="24" style="display:block;border:0;"></a></td>
<td style="padding:0 6px;"><a href="https://x.com/MukeshKuma48159" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="24" height="24" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>
<td style="padding:0 6px;"><a href="https://www.threads.com/@br30traderofficial" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="24" height="24" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>
<td style="padding:0 6px;"><a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="24" height="24" style="display:block;border:0;"></a></td>
</tr>
</table>
</div>

<div style="margin-top:28px;padding-top:18px;border-top:1px solid rgba(255,255,255,.05);">
<div style="color:#9ca3af;font-size:10px;letter-spacing:2px;line-height:1.9;text-transform:uppercase;">EST. 2026 | Secure Trading Infrastructure | BR30 Master System</div>
<div style="margin-top:8px;color:#4b5563;font-size:9px;letter-spacing:1.2px;">© 2026 BR30 Global Service • Secure Access Guaranteed</div>
<div style="margin-top:10px;color:#374151;font-size:8px;letter-spacing:1px;">SYSTEM SESSION VERIFIED • ENCRYPTED MAIL CHANNEL ACTIVE</div>
</div>

<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">WELCOME-${Date.now()}-${user?.email}</div>

</div>

</div>
</body>
</html>`;
};

// 🔐 UPGRADED REGISTER OTP TEMPLATE (User & Admin) v2.5
const otpTemplate = (name, otp, isMaster) => {
  const syncId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  // 👑 MASTER ADMIN TEMPLATE
  if (isMaster) {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>BR30 Master Authentication</title>

<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:0;margin:0;}
.card{max-width:520px;margin:auto;background:#050505;border-radius:28px;border:2px solid rgba(212,175,55,.45);overflow:hidden;box-shadow:0 0 55px rgba(212,175,55,.18);}
.banner{width:100%;height:auto;display:block;border-bottom:2px solid #d4af37;}
.content{padding:42px 32px;text-align:center;color:#ffffff!important;}
.otp-box{background:linear-gradient(145deg,rgba(212,175,55,.06),rgba(0,0,0,1));border:1px dashed #d4af37;border-radius:18px;padding:28px;margin:32px 0;box-shadow:0 0 25px rgba(212,175,55,.08);}
.otp-code{margin:0;font-size:42px;letter-spacing:12px;color:#ff4d4d!important;font-weight:900;text-shadow:0 0 18px rgba(255,77,77,.55);}
.footer{background:#010101;padding:38px 30px;text-align:center;border-top:1px solid #1a1a1a;}
.admin-tag{color:#d4af37!important;font-weight:900;font-size:16px;letter-spacing:1.3px;text-shadow:0 0 10px rgba(212,175,55,.45);}
</style>

</head>

<body class="email-body">

<div class="card">

<img src="https://res.cloudinary.com/dw4imlekm/image/upload/v1779141465/Green_burner_qc5lon.jpg" alt="Admin Access" class="banner">

<div class="content">

<div style="color:#d4af37;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2.5px;text-shadow:0 0 18px rgba(212,175,55,.45);">
👑 MASTER ADMIN AUTHORIZATION
</div>

<p style="color:#cbd5e1!important;font-size:15px;line-height:1.9;margin-top:18px;">
Hello <b style="color:#ffffff;">Mukesh Raj</b>,<br><br>

A secure authentication request has been initiated for the BR30 Master Admin account.<br>

Use the verification code below to complete your protected access request.
</p>

<div class="otp-box">

<h1 class="otp-code">${otp}</h1>

</div>

<p style="color:#ff4d4d!important;font-size:12px;font-weight:900;letter-spacing:1px;line-height:1.8;">
⚠️ SECURITY WARNING: Never share this verification code with anyone.
</p>

<div style="display:none;">
Trace: ${syncId}
</div>

</div>

<!-- FOOTER -->
<div class="footer">

<div style="color:#94a3b8;font-size:13px;line-height:1.9;">

Regards,<br>

<span class="admin-tag">
BR30 Support Team
</span><br>

<span style="color:#64748b;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
System Master Admin Access
</span>

</div>

<!-- NOTICE -->
<div style="margin-top:20px;padding:15px 18px;background:rgba(212,175,55,.04);border:1px solid rgba(212,175,55,.18);border-radius:14px;">

<p style="margin:0;color:#cbd5e1!important;font-size:10px;font-style:italic;letter-spacing:1px;line-height:1.9;">

🚫 <b style="color:#ffd700;">OFFICIAL SECURITY NOTICE:</b>

This is an automated security broadcast generated by the BR30 Master Authentication System.

Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.

</p>

</div>

<p style="color:#ffd700!important;font-size:11px;margin-top:22px;font-weight:900;letter-spacing:2px;text-shadow:0 0 10px rgba(255,215,0,.35);">
🛡️ ROOT AUTHENTICATION VERIFIED
</p>

<!-- SOCIAL -->
<div style="margin-top:30px;padding-top:24px;border-top:1px solid #111;">

<p style="color:#00ff88;font-size:11px;font-weight:800;letter-spacing:3px;margin-bottom:22px;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.25);">
STAY CONNECTED WITH BR30 🚀
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">

<tr>

<td style="padding:0 6px;">
<a href="https://www.youtube.com/@br30traderofficial" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://www.instagram.com/br30Traderofficial" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://x.com/MukeshKuma48159" target="_blank">
<img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="24" height="24" style="display:block;border:0;background:#000;border-radius:50%;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://www.threads.com/@br30traderofficial" target="_blank">
<img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="24" height="24" style="display:block;border:0;background:#000;border-radius:50%;">
</a>
</td>

<td style="padding:0 6px;">
<a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="24" height="24" style="display:block;border:0;">
</a>
</td>

</tr>

</table>

</div>

<!-- BOTTOM -->
<div style="margin-top:26px;padding-top:18px;border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:#6b7280;letter-spacing:1.5px;text-align:center;line-height:1.9;">

© 2026 BR30 Master Infrastructure<br>

SESSION HASH:
<span style="color:#d4af37;">
${syncId.substring(0, 6)}
</span>

</div>

<!-- GMAIL ANTI COLLAPSE -->
<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">
ADMIN-AUTH-${Date.now()}-${syncId}
</div>

</div>

</div>

</body>
</html>`;
  }
  // 🎓 2. USER TEMPLATE (GREEN THEME)
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>BR30 Verification</title>

<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:0;margin:0;}
.card{max-width:520px;margin:auto;background:#050505;border-radius:28px;border:2px solid rgba(0,255,136,.35);overflow:hidden;box-shadow:0 0 55px rgba(0,255,136,.16);}
.banner{width:100%;height:auto;display:block;border-bottom:2px solid #00ff88;}
.content{padding:42px 32px;text-align:center;color:#ffffff!important;}
.otp-box{background:linear-gradient(145deg,rgba(0,255,136,.06),rgba(0,0,0,1));border:1px dashed #00ff88;border-radius:18px;padding:28px;margin:32px 0;box-shadow:0 0 25px rgba(0,255,136,.08);}
.otp-code{margin:0;font-size:42px;letter-spacing:12px;color:#00ff88!important;font-weight:900;text-shadow:0 0 18px rgba(0,255,136,.45);}
.footer{background:#010101;padding:38px 30px;text-align:center;border-top:1px solid #1a1a1a;}
.brand-tag{color:#00ff88!important;font-weight:900;font-size:16px;letter-spacing:1.2px;text-shadow:0 0 10px rgba(0,255,136,.35);}
</style>

</head>

<body class="email-body">

<div class="card">

<img src="https://res.cloudinary.com/dw4imlekm/image/upload/v1779141465/Green_burner_qc5lon.jpg" alt="Welcome to BR30" class="banner">

<div class="content">

<div style="color:#00ff88;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2.5px;text-shadow:0 0 18px rgba(0,255,136,.45);">
🔐 REGISTER OTP VERIFICATION
</div>

<p style="color:#cbd5e1!important;font-size:15px;line-height:1.9;margin-top:18px;">
Hello <b style="color:#ffffff;">${name}</b>,<br><br>

Your professional trading journey officially starts here.<br>

Use the secure verification code below to activate and verify your BR30 account.
</p>

<div class="otp-box">

<h1 class="otp-code">${otp}</h1>

</div>

<p style="color:#ff4d4d!important;font-size:12px;font-weight:900;letter-spacing:1px;line-height:1.8;">
⚠️ SECURITY WARNING: This verification code is valid for 10 minutes only.
</p>

<div style="display:none;">
Trace: ${syncId} | Node: ${timestamp}
</div>

</div>

<!-- FOOTER -->
<div class="footer">

<div style="color:#94a3b8;font-size:13px;line-height:1.9;">

Regards,<br>

<span class="brand-tag">
BR30 Support Team
</span><br>

<span style="color:#64748b;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
Official Support & Security Division
</span>

</div>

<!-- NOTICE -->
<div style="margin:22px auto 0;max-width:460px;padding:15px 18px;background:linear-gradient(145deg,rgba(0,255,136,.07),rgba(255,255,255,.02));border:1px solid rgba(0,255,136,.18);border-radius:16px;box-shadow:0 0 24px rgba(0,255,136,.08);">

<p style="margin:0;color:#d1d5db!important;font-size:10.5px;font-style:italic;letter-spacing:1px;line-height:1.9;">

🚫 <b style="color:#00ff88;">OFFICIAL NOTICE:</b>

This is an automated security broadcast generated by the BR30 Authentication System.

Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.

</p>

</div>

<!-- VERIFIED -->
<p style="color:#00ff88!important;font-size:11px;margin-top:22px;font-weight:900;letter-spacing:2.2px;text-shadow:0 0 12px rgba(0,255,136,.45);">
🛡️ ACCOUNT VERIFICATION ACTIVE
</p>

<!-- SOCIAL -->
<div style="margin-top:30px;padding-top:24px;border-top:1px solid rgba(255,255,255,.08);">

<p style="color:#00ff88;font-size:11px;font-weight:900;letter-spacing:3px;margin-bottom:20px;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.25);">
STAY CONNECTED WITH BR30 🚀
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">

<tr>

<td style="padding:0 5px;">
<a href="https://www.youtube.com/@br30traderofficial" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.instagram.com/br30Traderofficial" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://x.com/MukeshKuma48159" target="_blank">
<img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.threads.com/@br30traderofficial" target="_blank">
<img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

</tr>

</table>

</div>

<!-- BOTTOM -->
<div style="margin-top:26px;padding-top:18px;border-top:1px solid rgba(255,255,255,.06);font-size:10px;color:#6b7280;letter-spacing:1.5px;text-align:center;line-height:1.9;">

© 2026 BR30 Global Service<br>

SESSION HASH:
<span style="color:#00ff88;">
${syncId.substring(0, 6)}
</span>

</div>

<!-- GMAIL ANTI COLLAPSE -->
<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">
BR30-VERIFY-${Date.now()}-${syncId}
</div>

</div>

</div>

</body>
</html>`;
};

// Helper function to keep code clean
function getSocialLinksHTML() {
  return `
<div style="margin-top:25px;padding-top:20px;border-top:1px solid #111;text-align:center;">
  <p style="color:#00ff88;font-size:11px;letter-spacing:2px;margin-bottom:18px;">STAY CONNECTED WITH BR30 🚀</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:collapse;">
    <tr>
      <td style="padding:0 5px;"><a href="https://www.youtube.com/@br30traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="24" height="24" style="display:block;border:0;"></a></td>
      <td style="padding:0 5px;"><a href="https://www.instagram.com/br30Traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" height="24" style="display:block;border:0;"></a></td>
      <td style="padding:0 5px;"><a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" height="24" style="display:block;border:0;"></a></td>
      <td style="padding:0 5px;"><a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="24" height="24" style="display:block;border:0;"></a></td>
      <td style="padding:0 5px;"><a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="24" height="24" style="display:block;border:0;"></a></td>
      <td style="padding:0 5px;"><a href="https://x.com/MukeshKuma48159" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="24" height="24" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>
      <td style="padding:0 5px;"><a href="https://www.threads.com/@br30traderofficial" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="24" height="24" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>
      <td style="padding:0 5px;"><a href="https://www.linkedin.com/in/mukesh-raj-b75a65253" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="24" height="24" style="display:block;border:0;"></a></td>
    </tr>
  </table>
</div>`;
}

// 🔐 UPGRADED FORGOT OTP TEMPLATE (User & Admin) v2.5
const forgotOtpTemplate = (name, otp, isMaster) => {
  const traceId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  const mainTitle = isMaster ? "🚨 MASTER ADMIN ACCESS RESET" : "🔐 PASSWORD RESET REQUEST";

  const welcomeMsg = isMaster
    ? `Hello <b style="color:#ffffff;">Master Admin</b>,<br><br>A secure administrative credential reset request has been initiated for your BR30 Master account.<br>Please use the protected verification code below to continue securely.`
    : `Hello <b style="color:#ffffff;">${name}</b>,<br><br>We received a request to reset your BR30 account password.<br>Please use the secure verification code below to continue safely.`;

  return `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">
<title>BR30 Password Reset</title>

<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:0;margin:0;}
.card{max-width:520px;margin:auto;background:#050505;border-radius:28px;border:2px solid rgba(255,77,77,.35);overflow:hidden;box-shadow:0 0 55px rgba(255,77,77,.18);}
.banner{width:100%;height:auto;display:block;border-bottom:2px solid #ff4d4d;}
.content{padding:42px 32px;text-align:center;color:#ffffff!important;}
.otp-box{background:linear-gradient(145deg,rgba(255,77,77,.06),rgba(0,0,0,1));border:1px dashed #ff4d4d;border-radius:18px;padding:28px;margin:32px 0;box-shadow:0 0 25px rgba(255,77,77,.08);}
.otp-code{margin:0;font-size:42px;letter-spacing:12px;color:#ff4d4d!important;font-weight:900;text-shadow:0 0 18px rgba(255,77,77,.55);}
.footer{background:#010101;padding:38px 30px;text-align:center;border-top:1px solid #1a1a1a;}
.security-tag{color:#ff4d4d!important;font-weight:900;font-size:16px;letter-spacing:1.3px;text-shadow:0 0 10px rgba(255,77,77,.45);}
</style>

</head>

<body class="email-body">

<div class="card">

<!-- BANNER -->
<img src="https://res.cloudinary.com/dw4imlekm/image/upload/v1779141465/Green_burner_qc5lon.jpg" alt="Security Lockdown" class="banner">

<div class="content">

<!-- TITLE -->
<div style="color:#ff4d4d;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;text-shadow:0 0 18px rgba(255,77,77,.45);">
${mainTitle}
</div>

<!-- MESSAGE -->
<p style="color:#cbd5e1!important;font-size:15px;line-height:1.9;margin-top:18px;">
${welcomeMsg}
</p>

<!-- OTP -->
<div class="otp-box">

<h1 class="otp-code">
${otp}
</h1>

<p style="color:#94a3b8;font-size:11px;margin-top:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
Expires In 5 Minutes
</p>

</div>

<!-- WARNING -->
<p style="color:#ff4d4d!important;font-size:12px;font-weight:900;letter-spacing:1px;line-height:1.8;">
⚠️ SECURITY WARNING: Never share this verification code with anyone.
</p>

<!-- HELP -->
<div style="margin-top:22px;padding:16px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:14px;">

<p style="margin:0;color:#cbd5e1;font-size:12px;line-height:1.8;">
If you did not request this password reset, please secure your account immediately and contact the BR30 Security Team.
</p>

</div>

<!-- HIDDEN TRACE -->
<div style="display:none;white-space:nowrap;font-size:0px;line-height:0px;">
Security-Protocol: ${traceId} | Sync-Stamp: ${timestamp}
</div>

</div>

<!-- FOOTER -->
<div class="footer" style="background:linear-gradient(180deg,#040404,#000000);padding:38px 28px;text-align:center;border-top:1px solid rgba(255,77,77,.12);">

<!-- TEAM -->
<div style="color:#94a3b8;font-size:13px;line-height:1.9;">

Regards,<br>

<span class="security-tag">
BR30 Security Team
</span><br>

<span style="color:#64748b;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;">
Official Support & Security Division
</span>

</div>

<!-- DISPATCH -->
<div style="margin-top:22px;padding:14px 16px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:14px;box-shadow:0 0 18px rgba(255,77,77,.05);">

<p style="color:#cbd5e1!important;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.8;">

🚀 <b>Dispatch Status:</b> Successfully transmitted at
<span style="color:#ff4d4d;">${timestamp}</span><br>

Tracking Reference:
<span style="color:#ffffff;">${traceId}</span>

</p>

</div>

<!-- NO REPLY -->
<div style="margin-top:18px;padding:15px 18px;background:linear-gradient(145deg,rgba(255,77,77,.04),rgba(255,255,255,.01));border:1px solid rgba(255,77,77,.14);border-radius:14px;">

<p style="color:#94a3b8;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.9;">

🚫 <b style="color:#ff4d4d;">OFFICIAL NOTICE:</b>

This is an automated security broadcast from the BR30 Infrastructure Network.

Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.

</p>

</div>

<!-- VERIFIED -->
<p style="color:#ff4d4d!important;font-size:11px;margin-top:22px;font-weight:900;letter-spacing:2px;text-shadow:0 0 10px rgba(255,77,77,.45);">
🔐 SECURITY CHANNEL VERIFIED
</p>

<!-- SOCIAL -->
<div style="margin-top:28px;padding-top:22px;border-top:1px solid #111;text-align:center;">

<p style="color:#00ff88;font-size:11px;letter-spacing:3px;margin-bottom:20px;font-weight:900;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.25);">
STAY CONNECTED WITH BR30 🚀
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">

<tr>

<td style="padding:0 5px;">
<a href="https://www.youtube.com/@br30traderofficial" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.instagram.com/br30Traderofficial" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://x.com/MukeshKuma48159" target="_blank">
<img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.threads.com/@br30traderofficial" target="_blank">
<img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

</tr>

</table>

</div>

<!-- BOTTOM -->
<div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:#475569;text-align:center;letter-spacing:1.5px;line-height:1.8;">

SECURE AUTH NODE:
<span style="color:#ff4d4d;">
${traceId.substring(0, 6)}
</span>

| EST. 2026 | © BR30ᴛʀᴀᴅᴇʀ

</div>

<!-- GMAIL ANTI COLLAPSE -->
<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">
RESET-AUTH-${Date.now()}-${traceId}
</div>

</div>

</div>

</body>
</html>`;
};

// 💎 UPGRADED PURCHASE/VIP WELCOME TEMPLATE v2.5
const purchaseTemplate = (name, courseName) => {
  const syncId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">
<title>BR30 VIP Access</title>

<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:0;margin:0;}
.card{max-width:620px;margin:auto;background:#050505;border-radius:30px;border:2px solid rgba(0,255,136,.35);overflow:hidden;box-shadow:0 0 55px rgba(0,255,136,.18);}
.banner{width:100%;display:block;border-bottom:3px solid #00ff88;}
.content{padding:45px 35px;text-align:center;color:#ffffff!important;}
.alert-title{color:#00ff88!important;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:2px;text-shadow:0 0 18px rgba(0,255,136,.45);margin-bottom:25px;}
.message-box{background:linear-gradient(145deg,rgba(0,255,136,.06),rgba(0,0,0,1));border-left:5px solid #00ff88;padding:28px;border-radius:16px;color:#e2e8f0;font-size:16px;margin-bottom:25px;text-align:left;line-height:1.9;box-shadow:0 0 25px rgba(0,255,136,.08);}
.login-btn{display:inline-block;padding:16px 38px;background:#00ff88;color:#000000!important;font-weight:900;text-decoration:none;border-radius:12px;box-shadow:0 0 22px rgba(0,255,136,.4);text-transform:uppercase;letter-spacing:1px;font-size:14px;}
.footer{background:#010101;padding:38px 28px;text-align:center;border-top:1px solid rgba(212,175,55,.18);}
.admin-tag{color:#d4af37!important;font-weight:900;font-size:16px;letter-spacing:1.3px;text-shadow:0 0 12px rgba(212,175,55,.45);}
</style>

</head>

<body class="email-body">

<div class="card">

<!-- BANNER -->
<img src="https://res.cloudinary.com/dw4imlekm/image/upload/v1779141465/Green_burner_qc5lon.jpg" alt="BR30 Official" class="banner">

<div class="content">

<!-- TITLE -->
<h1 class="alert-title">
💎 VIP ACCESS UNLOCKED 🚀
</h1>

<!-- MESSAGE -->
<div class="message-box">

Hello <b style="color:#ffffff;">${name}</b>,<br><br>

🎉 Congratulations! Your purchase for
<b style="color:#00ff88;">${courseName}</b>
has been successfully confirmed.<br><br>

Your <b style="color:#ffd700;">VIP MEMBER ACCESS</b>
is now fully activated and premium learning resources have been unlocked successfully. 💸<br><br>

You now have access to the BR30 professional ecosystem including VIP community access, premium support, strategy updates, and advanced trading guidance.

</div>

<!-- CTA -->
<div style="margin-top:32px;">

<a href="https://t.me/+hBAT4kWo63A4ZWY1" class="login-btn">
JOIN OUR VIP COMMUNITY
</a>

</div>

<!-- STATUS -->
<div style="margin-top:35px;padding:16px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;">

<p style="color:#cbd5e1!important;font-size:13px;line-height:1.9;margin:0;">

<b style="color:#00ff88;">Exclusive Member Status:</b><br>

Your elite trading journey officially begins now with BR30ᴛʀᴀᴅᴇʀ. ✅

</p>

</div>

<!-- HIDDEN TRACE -->
<div style="display:none;white-space:nowrap;font-size:0px;line-height:0px;">
VIP-Activation-ID: ${syncId} | Timestamp: ${timestamp}
</div>

</div>

<!-- FOOTER -->
<div class="footer" style="background:linear-gradient(180deg,#050505,#000000);padding:38px 28px;text-align:center;border-top:1px solid rgba(212,175,55,.18);">

<!-- TEAM -->
<div style="color:#94a3b8;font-size:13px;line-height:1.9;">

Regards,<br>

<span class="admin-tag">
BR30 Support Team
</span><br>

<span style="color:#64748b;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
Official Support & Security Division
</span>

</div>

<!-- LOG -->
<div style="margin-top:22px;padding:15px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(212,175,55,.10);border-radius:14px;box-shadow:0 0 18px rgba(212,175,55,.05);">

<p style="color:#cbd5e1!important;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.8;">

🚀 <b>OFFICIAL LOG:</b>

Transaction successfully recorded at
<span style="color:#d4af37;">${timestamp}</span><br>

Reference ID:
<span style="color:#ffffff;">${syncId}</span>

</p>

</div>

<!-- NOTICE -->
<div style="margin-top:18px;padding:15px 18px;background:linear-gradient(145deg,rgba(212,175,55,.05),rgba(255,255,255,.01));border:1px solid rgba(212,175,55,.14);border-radius:14px;">

<p style="color:#94a3b8;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.9;">

🚫 <b style="color:#ffd700;">OFFICIAL NOTICE:</b>

This is an automated system-generated message from BR30 Security Infrastructure.

Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.

</p>

</div>

<!-- VERIFIED -->
<p style="color:#ffd700!important;font-size:11px;margin-top:22px;font-weight:900;letter-spacing:2px;text-shadow:0 0 10px rgba(255,215,0,.35);">
🛡️ ROOT AUTHENTICATION VERIFIED
</p>

<!-- SOCIAL -->
<div style="margin-top:28px;padding-top:22px;border-top:1px solid #111;text-align:center;">

<p style="color:#00ff88;font-size:11px;letter-spacing:3px;margin-bottom:20px;font-weight:900;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.25);">
STAY CONNECTED WITH BR30 🚀
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">

<tr>

<td style="padding:0 5px;">
<a href="https://www.youtube.com/@br30traderofficial" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.instagram.com/br30Traderofficial" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://x.com/MukeshKuma48159" target="_blank">
<img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.threads.com/@br30traderofficial" target="_blank">
<img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;">
</a>
</td>

<td style="padding:0 5px;">
<a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="26" height="26" style="display:block;border:0;">
</a>
</td>

</tr>

</table>

</div>

<!-- BOTTOM -->
<div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:#64748b;letter-spacing:1.5px;line-height:1.8;text-align:center;">

SECURE AUTH NODE:
<span style="color:#d4af37;">
${syncId.substring(0, 6)}
</span>

| EST. 2026 | © BR30ᴛʀᴀᴅᴇʀ

</div>

<!-- GMAIL ANTI COLLAPSE -->
<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">
VIP-PURCHASE-${Date.now()}-${syncId}
</div>

</div>

</div>

</body>
</html>`;
};

// 🚨 ADMIN ALERT TEMPLATE (Payment Fail) v2.5
const paymentFailAdminTemplate = (user, course, reason) => {
  const alertId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  const safeReason = reason || "Technical Issue / User Cancelled / Payment Gateway Failed";

  const recoverySubject = encodeURIComponent(`Need help completing your ${course.title} enrollment?`);

  const recoveryBody = encodeURIComponent(
    `Hi ${user.name},

We noticed that your payment for ${course.title} was not completed successfully.

No worries — if you faced any issue during checkout, our BR30 Support Team is here to help you complete your enrollment safely and quickly.

Please reply to this email if you need any assistance.`
  );

  return `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">
<title>Payment Failure Alert | BR30 Trader</title>

<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:30px 12px;margin:0;}
.card{max-width:620px;margin:auto;background:#050505;border-radius:30px;border:2px solid rgba(255,62,62,.35);overflow:hidden;box-shadow:0 0 55px rgba(255,62,62,.18);}
.banner{width:100%;display:block;border-bottom:3px solid #ff3e3e;}
.content{padding:42px 34px;color:#ffffff!important;}
.header{background:linear-gradient(135deg,#ff3e3e,#8b0000);color:#ffffff;padding:22px;text-align:center;font-weight:900;letter-spacing:2px;text-transform:uppercase;font-size:16px;text-shadow:0 0 12px rgba(255,255,255,.18);}
.alert-badge{display:inline-block;background:rgba(255,62,62,.12);color:#ff6b6b;border:1px solid rgba(255,62,62,.35);padding:8px 14px;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;}
.info-table{width:100%;border-collapse:collapse;margin-top:25px;background:rgba(255,255,255,.025);border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.06);}
.info-table td{padding:15px;border-bottom:1px solid #171717;font-size:14px;}
.label{color:#00ff88;font-weight:900;width:36%;text-transform:uppercase;font-size:11px;letter-spacing:1px;}
.value{color:#ffffff;font-weight:600;word-break:break-word;}
.action-box{background:linear-gradient(145deg,rgba(0,255,136,.06),rgba(0,0,0,1));border:1px dashed rgba(0,255,136,.75);padding:28px 22px;border-radius:20px;margin-top:30px;text-align:center;box-shadow:0 0 25px rgba(0,255,136,.08);}
.reply-btn{display:inline-block;padding:15px 30px;background:#00ff88;color:#000000!important;font-weight:900;font-size:13px;text-decoration:none;border-radius:12px;text-transform:uppercase;letter-spacing:1px;box-shadow:0 0 22px rgba(0,255,136,.35);}
.footer{background:linear-gradient(180deg,#050505,#000000);padding:38px 28px;text-align:center;border-top:1px solid rgba(255,62,62,.18);}
.security-tag{color:#ff3e3e!important;font-weight:900;font-size:16px;letter-spacing:1.3px;text-shadow:0 0 12px rgba(255,62,62,.45);}
</style>

</head>

<body class="email-body">

<div class="card">

<!-- HEADER -->
<div class="header">
🚨 INTERNAL ALERT: PAYMENT FAILURE DETECTED
</div>

<div class="content">

<!-- BADGE -->
<div style="text-align:center;">
<span class="alert-badge">
⚠️ Payment Recovery Required
</span>
</div>

<!-- MESSAGE -->
<p style="font-size:15px;line-height:1.9;color:#e2e8f0;margin-top:24px;text-align:center;">

A user attempted to purchase a premium course, but the payment process was not completed successfully.

Please review the transaction details below and take immediate recovery action.

</p>

<!-- TABLE -->
<table class="info-table">

<tr>
<td class="label">User Name</td>
<td class="value">${user.name || "N/A"}</td>
</tr>

<tr>
<td class="label">User Email</td>
<td class="value">${user.email || "N/A"}</td>
</tr>

<tr>
<td class="label">Course</td>
<td class="value">${course.title || "N/A"}</td>
</tr>

<tr>
<td class="label">Failure Reason</td>
<td class="value" style="color:#ff4d4d;font-weight:900;">
${safeReason}
</td>
</tr>

<tr>
<td class="label">Alert ID</td>
<td class="value">${alertId}</td>
</tr>

<tr>
<td class="label">Generated Time</td>
<td class="value">${timestamp}</td>
</tr>

</table>

<!-- ACTION BOX -->
<div class="action-box">

<p style="color:#00ff88;margin:0 0 15px;font-weight:900;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
Direct Recovery Action Panel
</p>

<a href="mailto:${user.email}?subject=${recoverySubject}&body=${recoveryBody}" class="reply-btn">
📧 SEND RECOVERY EMAIL
</a>

<p style="font-size:12px;margin:16px 0 0;color:#94a3b8;line-height:1.7;">
Clicking this button will open a pre-written recovery email for the user.
</p>

</div>

<!-- RECOMMENDATION -->
<div style="margin-top:26px;padding:16px;background:rgba(255,62,62,.05);border:1px solid rgba(255,62,62,.16);border-radius:14px;">

<p style="margin:0;color:#cbd5e1;font-size:12px;line-height:1.8;">

<b style="color:#ff4d4d;">Recommended Action:</b>

Contact the user as quickly as possible. A fast response can help recover the sale and increase customer trust.

</p>

</div>

<!-- HIDDEN TRACE -->
<div style="display:none;white-space:nowrap;font-size:0px;line-height:0px;">
Internal-Log-ID: ${alertId} | Generated-Time: ${timestamp} | User: ${user.email}
</div>

</div>

<!-- FOOTER -->
<div class="footer">

<!-- TEAM -->
<div style="color:#94a3b8;font-size:13px;line-height:1.9;">

Regards,<br>

<span class="security-tag">
BR30 Security Team
</span><br>

<span style="color:#64748b;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
Official Support & Security Division
</span>

</div>

<!-- LOG -->
<div style="margin-top:22px;padding:15px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(255,62,62,.12);border-radius:14px;box-shadow:0 0 18px rgba(255,62,62,.06);">

<p style="color:#cbd5e1!important;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.8;">

🚨 <b>OFFICIAL LOG:</b>

Payment failure alert generated at
<span style="color:#ff3e3e;">${timestamp}</span><br>

Reference ID:
<span style="color:#ffffff;">${alertId}</span>

</p>

</div>

<!-- NOTICE -->
<div style="margin-top:18px;padding:15px 18px;background:linear-gradient(145deg,rgba(255,62,62,.05),rgba(255,255,255,.01));border:1px solid rgba(255,62,62,.14);border-radius:14px;">

<p style="color:#94a3b8;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.9;">

🚫 <b style="color:#ff3e3e;">OFFICIAL NOTICE:</b>

This is an automated system-generated alert from BR30 Security Infrastructure.

Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.

</p>

</div>

<!-- VERIFIED -->
<p style="color:#ff3e3e!important;font-size:11px;margin-top:22px;font-weight:900;letter-spacing:2px;text-shadow:0 0 10px rgba(255,62,62,.35);">
🛡️ PAYMENT FAILURE EVENT VERIFIED
</p>

<!-- SOCIAL -->
<div style="margin-top:28px;padding-top:22px;border-top:1px solid #111;text-align:center;">

<p style="color:#00ff88;font-size:11px;letter-spacing:3px;margin-bottom:20px;font-weight:900;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.25);">
STAY CONNECTED WITH BR30 🚀
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">

<tr>

<td style="padding:0 5px;"><a href="https://www.youtube.com/@br30traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://www.instagram.com/br30Traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://x.com/MukeshKuma48159" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>

<td style="padding:0 5px;"><a href="https://www.threads.com/@br30traderofficial" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>

<td style="padding:0 5px;"><a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="26" height="26" style="display:block;border:0;"></a></td>

</tr>

</table>

</div>

<!-- BOTTOM -->
<div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:#64748b;letter-spacing:1.5px;line-height:1.8;text-align:center;">

SECURE ALERT NODE:
<span style="color:#ff3e3e;">
${alertId.substring(0, 6)}
</span>

| EST. 2026 | © BR30ᴛʀᴀᴅᴇʀ

</div>

<!-- GMAIL ANTI COLLAPSE -->
<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">
PAYMENT-FAIL-${Date.now()}-${alertId}
</div>

</div>

</div>

</body>
</html>`;
};

// 👤 UPGRADED USER TEMPLATE (Payment Fail Help) v2.5
const paymentFailUserTemplate = (user, course, reason) => {
  const traceId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  const safeReason = reason || "Payment Pending / Network Issue / Gateway Timeout";

  const waMsg = encodeURIComponent(
    `Hello BR30 Support Team,

My payment was not completed for "${course.title}".

Please help me complete my enrollment safely.

Reference ID: ${traceId}`
  );

  return `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">
<title>Payment Not Completed | BR30 Trader</title>

<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:30px 12px;margin:0;}
.card{max-width:620px;margin:auto;background:#050505;border-radius:30px;border:2px solid rgba(0,255,136,.35);overflow:hidden;box-shadow:0 0 55px rgba(0,255,136,.18);}
.banner{width:100%;display:block;border-bottom:3px solid #00ff88;}
.content{padding:45px 35px;text-align:left;color:#ffffff!important;}
.alert-title{color:#ff3e3e!important;font-size:24px;font-weight:900;text-shadow:0 0 15px rgba(255,62,62,.45);letter-spacing:2px;text-transform:uppercase;margin:0;}
.thanks-note{color:#00ff88!important;font-size:18px;font-weight:800;margin-bottom:10px;display:block;text-shadow:0 0 8px rgba(0,255,136,.35);}
.message-box{background:linear-gradient(145deg,rgba(0,255,136,.05),rgba(0,0,0,1));border-left:5px solid #00ff88;padding:28px;border-radius:16px;line-height:1.9;color:#e2e8f0!important;font-size:15px;margin:28px 0;box-shadow:0 0 22px rgba(0,255,136,.08);}
.support-btn{display:inline-block;padding:16px 36px;background:#00ff88;color:#000000!important;font-weight:900;font-size:14px;text-decoration:none;border-radius:12px;text-transform:uppercase;letter-spacing:1px;box-shadow:0 0 22px rgba(0,255,136,.4);}
.footer{background:linear-gradient(180deg,#050505,#000000);padding:38px 28px;text-align:center;border-top:1px solid rgba(212,175,55,.18);}
.admin-tag{color:#d4af37!important;font-weight:900;font-size:16px;letter-spacing:1.3px;text-shadow:0 0 12px rgba(212,175,55,.45);}
</style>

</head>

<body class="email-body">

<div class="card">

<!-- BANNER -->
<img src="https://res.cloudinary.com/dw4imlekm/image/upload/v1779141465/Green_burner_qc5lon.jpg" alt="BR30 Official" class="banner">

<div class="content">

<!-- TITLE -->
<span class="thanks-note">
Hi ${user.name}, We’re Here To Help! 🚀
</span>

<h1 class="alert-title">
⚠️ PAYMENT NOT COMPLETED
</h1>

<!-- SUB -->
<h3 style="color:#ffffff!important;font-size:18px;margin-top:22px;margin-bottom:8px;">
Important Order Status Update
</h3>

<!-- MESSAGE -->
<div class="message-box">

First of all, thank you for showing interest in
<b style="color:#00ff88;">${course.title}</b>. 💚<br><br>

We noticed that your payment process could not be completed successfully.<br><br>

This may happen due to network interruptions, bank server issues, payment timeout, or gateway verification problems.<br><br>

<span style="color:#ff4d4d;font-weight:900;">
Payment Status:
${safeReason}
</span><br><br>

We noticed that your payment was not completed successfully. But no worries — your enrollment process is still active and our BR30 Enrollment Team is here to assist you personally. ✅<br><br>

Click the button below to connect directly with our WhatsApp assistance team for quick support and secure payment help.

</div>

<!-- BUTTON -->
<div style="text-align:center;margin-top:32px;">

<a href="https://wa.me/916200986380?text=Hello%20BR30%20Support%20Team,%0A%0AMy%20payment%20was%20not%20completed%20for%20the%20course:%20${encodeURIComponent(course.title)}.%0A%0ACourse%20Price:%20₹${encodeURIComponent(course.price)}%0A%0APlease%20help%20me%20complete%20my%20enrollment%20securely.%0A%0AReference%20ID:%20${traceId}" class="support-btn">
💬 TALK TO SUPPORT ON WHATSAPP
</a>

</div>

<!-- HELP -->
<div style="margin-top:30px;padding:16px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:14px;">

<p style="margin:0;color:#cbd5e1;font-size:13px;line-height:1.9;text-align:center;">

Our team is available to assist you with payment verification, enrollment support, and technical help.

</p>

</div>

<!-- STATUS -->
<p style="color:#94a3b8!important;font-size:13px;text-align:center;margin-top:30px;font-style:italic;line-height:1.8;">
BR30 Support Team usually replies within 1–2 hours during daytime. 🌞<br>
During late-night hours, response time may take around 2–3 hours depending on support traffic. 🌙
</p>

<!-- TRACE -->
<div style="display:none;white-space:nowrap;font-size:0px;line-height:0px;">
Incident-Trace: ${traceId} | Sync-Stamp: ${timestamp}
</div>

</div>

<!-- FOOTER -->
<div class="footer">

<!-- TEAM -->
<div style="color:#94a3b8;font-size:13px;line-height:1.9;">

Regards,<br>

<span class="admin-tag">
BR30 Support Team
</span><br>

<span style="color:#64748b;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
Official Support & Security Division
</span>

</div>

<!-- LOG -->
<div style="margin-top:22px;padding:15px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(212,175,55,.12);border-radius:14px;box-shadow:0 0 18px rgba(212,175,55,.06);">

<p style="color:#cbd5e1!important;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.8;">

🚫 <b>OFFICIAL ALERT LOG:</b>

Alert generated at
<span style="color:#d4af37;">${timestamp}</span><br>

Reference ID:
<span style="color:#ffffff;">${traceId}</span>

</p>

</div>

<!-- NOTICE -->
<div style="margin-top:18px;padding:15px 18px;background:linear-gradient(145deg,rgba(212,175,55,.05),rgba(255,255,255,.01));border:1px solid rgba(212,175,55,.14);border-radius:14px;">

<p style="color:#94a3b8;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.9;">

🚫 <b style="color:#ffd700;">OFFICIAL NOTICE:</b>

This is an automated system-generated message from BR30 Security Infrastructure.

Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.

</p>

</div>

<!-- VERIFIED -->
<p style="color:#ffd700!important;font-size:11px;margin-top:22px;font-weight:900;letter-spacing:2px;text-shadow:0 0 10px rgba(255,215,0,.35);">
🛡️ SECURITY EVENT VERIFIED
</p>

<!-- SOCIAL -->
<div style="margin-top:28px;padding-top:22px;border-top:1px solid #111;text-align:center;">

<p style="color:#00ff88;font-size:11px;letter-spacing:3px;margin-bottom:20px;font-weight:900;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.25);">
STAY CONNECTED WITH BR30 🚀
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">

<tr>

<td style="padding:0 5px;"><a href="https://www.youtube.com/@br30traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://www.instagram.com/br30Traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://x.com/MukeshKuma48159" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>

<td style="padding:0 5px;"><a href="https://www.threads.com/@br30traderofficial" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>

<td style="padding:0 5px;"><a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="26" height="26" style="display:block;border:0;"></a></td>

</tr>

</table>

</div>

<!-- BOTTOM -->
<div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:#64748b;letter-spacing:1.5px;line-height:1.8;text-align:center;">

BR30 TRADER AUTOMATED SYSTEM v2.5<br>

SESSION ID:
<span style="color:#d4af37;">
${traceId.substring(0, 8)}
</span>

| SECURITY DIVISION | © 2026 BR30ᴛʀᴀᴅᴇʀ

</div>

<!-- GMAIL ANTI COLLAPSE -->
<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">
PAYMENT-FAIL-USER-${Date.now()}-${traceId}
</div>

</div>

</div>

</body>
</html>
  `;
};

// 💰 UPGRADED OFFER TEMPLATE v2.5
const offerTemplate = ({ discountValue, dynamicCoupon, htmlContent, userName = "Trader" }) => {
  const syncId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:25px 10px;margin:0;}
.card{max-width:600px;margin:auto;background:#050505;border-radius:30px;border:1px solid rgba(0,255,136,.4);overflow:hidden;box-shadow:0 0 50px rgba(0,255,136,.15);}
.banner{width:100%;display:block;border-bottom:3px solid #00ff88;}
.content{padding:45px 35px;text-align:left;color:#ffffff!important;}
.alert-title{color:#00ff88!important;font-size:26px;font-weight:900;text-shadow:0 0 15px rgba(0,255,136,.6);letter-spacing:3px;text-transform:uppercase;margin:0;}
.discount-box{background:linear-gradient(145deg,rgba(0,255,136,.08),rgba(0,0,0,1));border:2px dashed #00ff88;padding:30px;border-radius:20px;text-align:center;margin:25px 0;}
.coupon-code{background:#00ff88;color:#000000!important;font-size:32px;font-weight:900;padding:10px 20px;border-radius:12px;display:inline-block;margin:15px 0;letter-spacing:4px;box-shadow:0 0 20px rgba(0,255,136,.4);}
.login-btn{display:inline-block;padding:15px 35px;background:#00ff88;color:#000000!important;font-weight:900;font-size:16px;text-decoration:none;border-radius:12px;text-transform:uppercase;letter-spacing:1px;box-shadow:0 0 20px rgba(0,255,136,.4);margin-top:10px;}
.footer{background:#010101;padding:35px;text-align:center;border-top:1px solid #1a1a1a;}
.admin-tag{color:#00ff88!important;font-weight:800;font-size:16px;letter-spacing:1px;}
</style>

</head>

<body class="email-body">

<div class="card">

<img src="https://res.cloudinary.com/dw4imlekm/image/upload/v1779141465/Green_burner_qc5lon.jpg" alt="BR30 Official" class="banner">

<div class="content">

<h1 class="alert-title">
📢 SPECIAL OFFER
</h1>

<h3 style="color:#ffffff!important;font-size:20px;margin-top:25px;margin-bottom:10px;">
Hi ${userName}, Exclusive Trader Discount! 🚀
</h3>

<div class="discount-box">

<p style="color:#00ff88;font-size:16px;margin:0;font-weight:bold;">
Special <b>${discountValue}% DISCOUNT</b> coupon reserved for you:
</p>

<div class="coupon-code">
${dynamicCoupon}
</div>

<p style="color:#ff4d4d;font-size:12px;font-weight:bold;margin-top:10px;">
⚠️ VALID FOR 7 DAYS ONLY!
</p>

</div>

<div style="line-height:1.8;color:#e2e8f0;font-size:16px;margin-bottom:25px;">
${htmlContent || "We noticed that you have not unlocked premium access yet. This is your opportunity to join BR30ᴛʀᴀᴅᴇʀ with an exclusive limited-time discount and begin your professional trading journey."}
</div>

<div style="margin-top:25px;padding:18px;background:rgba(255,255,255,.02);border:1px solid rgba(0,255,136,.08);border-radius:16px;">

<p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.9;">

✅ Premium VIP Community Access<br>
✅ Lifetime Strategy Updates<br>
✅ Professional Trading Guidance<br>
✅ Future Course Upgrades Included<br>
✅ Direct Support Assistance

</p>

</div>

<div style="text-align:center;margin-top:35px;">

<a href="https://my-frontend-eight-roan.vercel.app/?scroll=coursesection" class="login-btn">
REDEEM & SAVE ${discountValue}%
</a>

</div>

<div style="margin-top:28px;padding:15px 18px;background:rgba(0,255,136,.04);border:1px solid rgba(0,255,136,.12);border-radius:14px;">

<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.8;text-align:center;">

Our BR30 Support Team usually replies within <b style="color:#00ff88;">1–2 hours during daytime</b>. 🌞<br>

During late-night hours, response time may take around <b style="color:#ffffff;">2–3 hours</b> depending on support traffic. 🌙

</p>

</div>

<!-- Hidden Gmail Trace -->
<div style="display:none;white-space:nowrap;font-size:0px;line-height:0px;">
Offer-Sync-ID: ${syncId} | Timestamp: ${timestamp}
</div>

</div>

<!-- FOOTER -->
<div class="footer" style="background:linear-gradient(180deg,#050505,#000000);padding:38px 28px;text-align:center;border-top:1px solid rgba(0,255,136,.12);">

<!-- Team -->
<div style="color:#94a3b8;font-size:13px;line-height:1.9;">

Regards,<br>

<span class="admin-tag" style="color:#00ff88!important;font-weight:900;font-size:16px;letter-spacing:1.3px;text-shadow:0 0 12px rgba(0,255,136,.45);">
BR30 Support Team
</span><br>

<span style="color:#64748b;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
Official Sales & Strategy Division
</span>

</div>

<!-- Dispatch -->
<div style="margin-top:22px;padding:15px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(0,255,136,.12);border-radius:14px;box-shadow:0 0 18px rgba(0,255,136,.06);">

<p style="color:#cbd5e1!important;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.8;">

🚀 <b>OFFICIAL SALES LOG:</b>

Personalized offer successfully dispatched at
<span style="color:#00ff88;">
${timestamp}
</span><br>

Reference ID:
<span style="color:#ffffff;">
${syncId}
</span>

</p>

</div>

<!-- Notice -->
<div style="margin-top:18px;padding:15px 18px;background:linear-gradient(145deg,rgba(0,255,136,.05),rgba(255,255,255,.01));border:1px solid rgba(0,255,136,.14);border-radius:14px;">

<p style="color:#94a3b8;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.9;">

🚫 <b style="color:#00ff88;">OFFICIAL NOTICE:</b>

This is an automated promotional communication from BR30 Sales Infrastructure.

Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.

</p>

</div>

<!-- Verified -->
<p style="color:#00ff88!important;font-size:11px;margin-top:22px;font-weight:900;letter-spacing:2px;text-shadow:0 0 10px rgba(0,255,136,.35);">
🛡️ SALES EVENT VERIFIED
</p>

<!-- Social -->
<div style="margin-top:28px;padding-top:22px;border-top:1px solid #111;text-align:center;">

<p style="color:#00ff88;font-size:11px;letter-spacing:3px;margin-bottom:20px;font-weight:900;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.25);">
STAY CONNECTED WITH BR30 🚀
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">

<tr>

<td style="padding:0 5px;"><a href="https://www.youtube.com/@br30traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://www.instagram.com/br30Traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://x.com/MukeshKuma48159" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>

<td style="padding:0 5px;"><a href="https://www.threads.com/@br30traderofficial" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>

<td style="padding:0 5px;"><a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="26" height="26" style="display:block;border:0;"></a></td>

</tr>

</table>

</div>

<!-- Bottom -->
<div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:#64748b;letter-spacing:1.5px;line-height:1.8;text-align:center;">

SECURE BATCH ID:
<span style="color:#00ff88;">
${syncId.substring(0, 6)}
</span>

| EST. 2026 | © BR30ᴛʀᴀᴅᴇʀ

</div>

<!-- Gmail Anti Collapse -->
<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">
OFFER-SYNC-${Date.now()}-${syncId}
</div>

</div>

</div>

</body>
</html>`;
};

// 💎 UPGRADED VIP TEMPLATE v2.5
const vipTemplate = ({ discountValue, dynamicCoupon, htmlContent, userName = "VIP Trader" }) => {
  const syncId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:25px 10px;margin:0;}
.card{max-width:600px;margin:auto;background:#050505;border-radius:30px;border:2px solid #00ff88;overflow:hidden;box-shadow:0 0 50px rgba(0,255,136,.2);}
.banner{width:100%;display:block;border-bottom:3px solid #00ff88;}
.content{padding:45px 35px;text-align:left;color:#ffffff!important;}
.alert-title{color:#00ff88!important;font-size:24px;font-weight:900;text-shadow:0 0 15px rgba(0,255,136,.6);letter-spacing:3px;text-transform:uppercase;margin:0;}
.vip-box{background:linear-gradient(145deg,rgba(0,255,136,.1),rgba(0,0,0,1));border-left:5px solid #00ff88;padding:25px;border-radius:15px;line-height:1.8;color:#e2e8f0!important;font-size:16px;margin:25px 0;}
.telegram-btn{display:inline-block;padding:15px 35px;background:#00ff88;color:#000000!important;font-weight:900;font-size:15px;text-decoration:none;border-radius:12px;text-transform:uppercase;letter-spacing:1px;box-shadow:0 0 20px rgba(0,255,136,.4);margin-top:10px;}
.footer{background:#010101;padding:35px;text-align:center;border-top:1px solid #1a1a1a;}
.admin-tag{color:#00ff88!important;font-weight:800;font-size:16px;text-shadow:0 0 5px #00ff88;}
</style>

</head>

<body class="email-body">

<div class="card">

<img src="https://res.cloudinary.com/dw4imlekm/image/upload/v1779141465/Green_burner_qc5lon.jpg" alt="BR30 VIP Official" class="banner">

<div class="content">

<h1 class="alert-title">
💎 VIP PRIVATE UPDATE
</h1>

<h3 style="color:#ffffff!important;font-size:20px;margin-top:25px;margin-bottom:10px;">
Priority Member Alert! 🚀
</h3>

<div class="vip-box">

Hi <b>${userName}</b>,<br><br>

You are one of our premium BR30ᴛʀᴀᴅᴇʀ VIP members and a brand-new exclusive update is now live for your account. 🚀<br><br>

<span style="color:#00ff88;font-weight:bold;">
📣 VIP Update:
${htmlContent || "A new premium strategy update and exclusive educational content has been uploaded to your dashboard."}
</span>

</div>

<p style="color:#e2e8f0;font-size:15px;margin-bottom:20px;line-height:1.9;">

You are part of our <b style="color:#00ff88;">Priority Circle</b>.<br>

All newly released strategies, updates, and market learning resources have already been activated on your VIP dashboard.

</p>

<div style="margin-top:28px;padding:18px;background:rgba(255,255,255,.02);border:1px solid rgba(0,255,136,.08);border-radius:16px;">

<p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.9;">

✅ Early VIP Content Access<br>
✅ Premium Market Updates<br>
✅ Strategy Improvement Sessions<br>
✅ Priority Learning Support<br>
✅ Future VIP Upgrades Included

</p>

</div>

<div style="text-align:center;margin-top:28px;">

<a href="https://t.me/+hBAT4kWo63A4ZWY1" class="telegram-btn">
CHECK NEW UPDATE NOW
</a>

</div>

<p style="color:#00ff88;font-size:12px;text-align:center;margin-top:18px;font-weight:bold;letter-spacing:1px;">
🚀 VIP SUPPORT: DIRECT ACCESS ENABLED
</p>

<!-- REVIEW -->
<div style="background:linear-gradient(145deg,rgba(0,255,136,.08),rgba(0,0,0,1));border:1px solid rgba(0,255,136,.35);border-radius:16px;padding:22px;margin-top:28px;text-align:center;">

<h3 style="color:#00ff88;margin:0 0 10px 0;font-size:18px;">
⭐ Share Your BR30 Experience
</h3>

<p style="color:#e2e8f0;font-size:14px;line-height:1.8;margin:0 0 18px 0;">

If BR30 Trader courses, VIP support, and market updates have helped you in your journey, we would truly appreciate your honest feedback on Trustpilot. ❤️

</p>

<a
href="https://www.trustpilot.com/review/my-frontend-eight-roan.vercel.app"
target="_blank"
style="display:inline-block;background:#00ff88;color:#000000!important;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:900;font-size:14px;letter-spacing:1px;box-shadow:0 0 20px rgba(0,255,136,.35);"
>
⭐ REVIEW BR30 TRADER
</a>

</div>

<!-- SUPPORT -->
<div style="margin-top:28px;padding:16px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:14px;">

<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.9;text-align:center;">

Our BR30 VIP Support Team usually replies within <b style="color:#00ff88;">1–2 hours during daytime</b>. 🌞<br>

During late-night hours, response time may take around <b style="color:#ffffff;">2–3 hours</b> depending on support traffic. 🌙

</p>

</div>

<p style="color:#94a3b8!important;font-size:13px;text-align:center;margin-top:35px;font-style:italic;">
<b>Exclusive Access:</b> VIP Benefits Active for your Account. ✅
</p>

<!-- HIDDEN -->
<div style="display:none;white-space:nowrap;font-size:0px;line-height:0px;">
Protocol-Sync: ${syncId} | Time: ${timestamp}
</div>

</div>

<!-- FOOTER -->
<div class="footer" style="background:linear-gradient(180deg,#050505,#000000);padding:38px 28px;text-align:center;border-top:1px solid rgba(168,85,247,.18);">

<!-- TEAM -->
<div style="color:#94a3b8;font-size:13px;line-height:1.9;">

Regards,<br>

<span class="admin-tag" style="color:#c084fc!important;font-weight:900;font-size:16px;letter-spacing:1.3px;text-shadow:0 0 12px rgba(192,132,252,.45);">
BR30 Support Team
</span><br>

<span style="color:#64748b;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
VIP Support & Strategy Division
</span>

</div>

<!-- VIP DISPATCH -->
<div style="margin-top:22px;padding:15px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(168,85,247,.14);border-radius:14px;box-shadow:0 0 18px rgba(168,85,247,.08);">

<p style="color:#cbd5e1!important;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.8;">

👑 <b>VIP BROADCAST LOG:</b>

Personalized VIP communication dispatched at
<span style="color:#c084fc;">
${timestamp}
</span><br>

Reference ID:
<span style="color:#ffffff;">
${syncId}
</span>

</p>

</div>

<!-- NO REPLY -->
<div style="margin-top:18px;padding:15px 18px;background:linear-gradient(145deg,rgba(168,85,247,.05),rgba(255,255,255,.01));border:1px solid rgba(168,85,247,.14);border-radius:14px;">

<p style="color:#94a3b8;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.9;">

🚫 <b style="color:#c084fc;">OFFICIAL NOTICE:</b>

This is an automated VIP communication from BR30 Strategic Infrastructure.

Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.

</p>

</div>

<!-- VERIFIED -->
<p style="color:#c084fc!important;font-size:11px;margin-top:22px;font-weight:900;letter-spacing:2px;text-shadow:0 0 10px rgba(192,132,252,.35);">
🛡️ VIP CHANNEL VERIFIED
</p>

<!-- SOCIAL -->
<div style="margin-top:28px;padding-top:22px;border-top:1px solid #111;text-align:center;">

<p style="color:#00ff88;font-size:11px;letter-spacing:3px;margin-bottom:20px;font-weight:900;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.25);">
STAY CONNECTED WITH BR30 🚀
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">

<tr>

<td style="padding:0 5px;"><a href="https://www.youtube.com/@br30traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://www.instagram.com/br30Traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://x.com/MukeshKuma48159" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>

<td style="padding:0 5px;"><a href="https://www.threads.com/@br30traderofficial" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>

<td style="padding:0 5px;"><a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="26" height="26" style="display:block;border:0;"></a></td>

</tr>

</table>

</div>

<!-- BOTTOM -->
<div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:#64748b;letter-spacing:1.5px;line-height:1.8;text-align:center;">

SECURE VIP NODE:
<span style="color:#c084fc;">
${syncId.substring(0, 6)}
</span>

| EST. 2026 | © BR30ᴛʀᴀᴅᴇʀ

</div>

<!-- GMAIL ANTI COLLAPSE -->
<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">
VIP-BROADCAST-${Date.now()}-${syncId}
</div>

</div>

</div>

</body>
</html>`;
};

// 📢 UPGRADED OFFICIAL ANNOUNCEMENT TEMPLATE v2.5
const getAnnouncementHTML = (subject, message) => {
  const syncId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<style>
body{margin:0;padding:0;background:transparent;font-family:Arial,Helvetica,sans-serif;}.email-body{background:transparent;padding:25px 10px;margin:0;}
.card{max-width:600px;margin:auto;background:#0a0a0a;border-radius:30px;border:2px solid #00ff88;overflow:hidden;box-shadow:0 0 40px rgba(0,255,136,.2);}
.banner{width:100%;height:auto;display:block;border-bottom:3px solid #00ff88;}
.content{padding:45px 35px;text-align:left;color:#ffffff!important;}
.alert-title{color:#00ff88!important;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0;text-shadow:0 0 10px rgba(0,255,136,.3);}
.message-box{background:linear-gradient(145deg,rgba(0,255,136,.05),rgba(0,0,0,1));border-left:5px solid #00ff88;padding:25px;border-radius:12px;line-height:1.9;color:#e2e8f0!important;font-size:16px;margin:25px 0;box-shadow:0 0 18px rgba(0,255,136,.08);}
.footer{background:#010101;padding:35px;text-align:center;border-top:1px solid #1a1a1a;}
.admin-tag{color:#00ff88!important;font-weight:800;font-size:16px;letter-spacing:1px;}
</style>

</head>

<body class="email-body">

<div class="card">

<!-- BANNER -->
<img src="https://res.cloudinary.com/dw4imlekm/image/upload/v1779141465/Green_burner_qc5lon.jpg" alt="BR30 Official Alert" class="banner">

<div class="content">

<!-- TITLE -->
<h1 class="alert-title">
📢 OFFICIAL ANNOUNCEMENT
</h1>

<!-- SUBJECT -->
<h3 style="color:#ffffff!important;font-size:20px;margin-top:25px;border-bottom:1px solid #1a1a1a;padding-bottom:10px;line-height:1.7;">
${subject}
</h3>

<!-- MESSAGE -->
<div class="message-box">
${message}
</div>

<!-- EXTRA -->
<div style="margin-top:28px;padding:18px;background:rgba(255,255,255,.02);border:1px solid rgba(0,255,136,.08);border-radius:16px;">

<p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.9;">

✅ Official BR30 Community Update<br>
✅ Important Market & Platform Information<br>
✅ Verified Strategic Announcement<br>
✅ Exclusive Member Notification System

</p>

</div>

<!-- SUPPORT -->
<div style="margin-top:28px;padding:16px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:14px;">

<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.9;text-align:center;">

Our BR30 Support Team usually replies within <b style="color:#00ff88;">1–2 hours during daytime</b>. 🌞<br>

During late-night hours, response time may take around <b style="color:#ffffff;">2–3 hours</b> depending on support traffic. 🌙

</p>

</div>

<!-- STATUS -->
<p style="color:#94a3b8!important;font-size:13px;text-align:center;margin-top:35px;font-style:italic;line-height:1.8;">
Official communication securely delivered through BR30ᴛʀᴀᴅᴇʀ infrastructure. ✅
</p>

<!-- HIDDEN TRACE -->
<div style="display:none;white-space:nowrap;font-size:0px;line-height:0px;">
Broadcast-ID: ${syncId} | Global-Sync: ${timestamp}
</div>

</div>

<!-- FOOTER -->
<div class="footer" style="background:linear-gradient(180deg,#050505,#000000);padding:40px 28px;text-align:center;border-top:1px solid rgba(212,175,55,.18);">

<!-- ADMIN -->
<div style="color:#94a3b8;font-size:13px;line-height:1.9;">

Regards,<br>

<span class="admin-tag" style="color:#d4af37!important;font-weight:900;font-size:17px;letter-spacing:1.4px;text-shadow:0 0 14px rgba(212,175,55,.45);">
Mukesh Raj (MASTER ADMIN)
</span><br>

<span style="color:#64748b;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
BR30ᴛʀᴀᴅᴇʀ Professional Services
</span>

</div>

<!-- DISPATCH -->
<div style="margin-top:22px;padding:16px 18px;background:rgba(255,255,255,.02);border:1px solid rgba(212,175,55,.12);border-radius:14px;box-shadow:0 0 18px rgba(212,175,55,.06);">

<p style="color:#cbd5e1!important;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.8;">

🚀 <b>MASTER SYSTEM LOG:</b>

Official communication dispatched at
<span style="color:#d4af37;">
${timestamp}
</span><br>

Reference ID:
<span style="color:#ffffff;">
${syncId}
</span>

</p>

</div>

<!-- NOTICE -->
<div style="margin-top:18px;padding:15px 18px;background:linear-gradient(145deg,rgba(212,175,55,.05),rgba(255,255,255,.01));border:1px solid rgba(212,175,55,.14);border-radius:14px;">

<p style="color:#94a3b8;font-size:10px;margin:0;font-style:italic;letter-spacing:1px;line-height:1.9;">

🚫 <b style="color:#ffd700;">OFFICIAL NOTICE:</b>

This is an automated communication generated by the BR30 Master Infrastructure System.

Please <b style="color:#ffffff;">DO NOT REPLY</b> to this email.

</p>

</div>

<!-- VERIFIED -->
<p style="color:#ffd700!important;font-size:11px;margin-top:22px;font-weight:900;letter-spacing:2px;text-shadow:0 0 10px rgba(255,215,0,.35);">
🛡️ MASTER AUTHENTICATION VERIFIED
</p>

<!-- SOCIAL -->
<div style="margin-top:28px;padding-top:22px;border-top:1px solid #111;text-align:center;">

<p style="color:#00ff88;font-size:11px;letter-spacing:3px;margin-bottom:20px;font-weight:900;text-transform:uppercase;text-shadow:0 0 10px rgba(0,255,136,.25);">
STAY CONNECTED WITH BR30 🚀
</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:auto;border-collapse:collapse;">

<tr>

<td style="padding:0 5px;"><a href="https://www.youtube.com/@br30traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://www.instagram.com/br30Traderofficial" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://t.me/+hBAT4kWo63A4ZWY1" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="26" height="26" style="display:block;border:0;"></a></td>

<td style="padding:0 5px;"><a href="https://x.com/MukeshKuma48159" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>

<td style="padding:0 5px;"><a href="https://www.threads.com/@br30traderofficial" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/threads.png" width="26" height="26" style="display:block;border:0;background:#000;border-radius:50%;"></a></td>

<td style="padding:0 5px;"><a href="https://www.linkedin.com/in/mukeshraj-br30/" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="26" height="26" style="display:block;border:0;"></a></td>

</tr>

</table>

</div>

<!-- BOTTOM -->
<div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:#64748b;letter-spacing:1.5px;line-height:1.8;text-align:center;">

SYSTEM NODE:
<span style="color:#d4af37;">
${syncId.substring(0, 6)}
</span>

| EST. 2026 | © BR30ᴛʀᴀᴅᴇʀ

</div>

<!-- GMAIL ANTI COLLAPSE -->
<div style="display:none;white-space:nowrap;font-size:0;line-height:0;color:#000;">
MASTER-BROADCAST-${Date.now()}-${syncId}
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
// ==========================================================================
// ✅ UTILS STATUS: EMAIL TEMPLATES ORGANIZED & VALIDATED.
// 🚀 DISPATCH SYSTEM: READY FOR PRODUCTION DELIVERY!
// ==========================================================================
