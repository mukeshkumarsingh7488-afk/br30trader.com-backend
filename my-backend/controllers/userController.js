//#region Imports
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const Coupon = require("../models/Coupon");
//#endregion

//#region GET USER STATS (Admin Panel ke liye user stats dikhane ke liye)
// 1. Stats dikhane ke liye function
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const vipCount = await User.countDocuments({
      badge: { $regex: /^vip$/i },
    });
    const normalCount = totalUsers - vipCount;

    res.status(200).json({
      success: true,
      totalUsers,
      vipCount,
      normalCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region Professional Email Marketing Coupan Function (With 7-Day Expiry)
// 2. Professional Email Marketing Function (With 7-Day Expiry)
exports.sendMarketingMail = async (req, res) => {
  try {
    const { subject, htmlContent, target } = req.body;

    // --- 🏷️ DYNAMIC DISCOUNT LOGIC ---
    const discountMatch = subject.match(/(\d+)%/);
    const discountValue = discountMatch ? discountMatch[1] : "50";
    const dynamicCoupon = `OFFER${discountValue}`;

    // 🔥 DATABASE MEIN COUPON SAVE KARNA (With 7-Day Expiry)
    await Coupon.findOneAndUpdate(
      { code: dynamicCoupon.toUpperCase() },
      {
        discount: parseInt(discountValue),
        isActive: true,
        // ⏳ Naya logic: Aaj se theek 7 din baad expire hoga
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      { upsert: true, new: true },
    );

    // --- 🎨 PROFESSIONAL HTML DESIGNS ---

    // 🏷️ PROFESSIONAL CYBER NEON Normal user DISCOUNT TEMPLATE
    const offerTemplate = `
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

    // 🏷️ VIP EXCLUSIVE UPDATE TEMPLATE (New Course & Telegram Access)
    const vipTemplate = `
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

    // --- 🔍 TARGETING & FILTERING ---
    let filter = {};
    let finalHtml = "";

    if (target === "vip") {
      filter = { $or: [{ badge: { $regex: /^vip$/i } }, { isVip: true }] };
      finalHtml = vipTemplate;
    } else if (target === "normal") {
      filter = { badge: { $not: { $regex: /^vip$/i } }, isVip: false };
      finalHtml = offerTemplate;
    } else {
      finalHtml = offerTemplate;
    }

    const targetUsers = await User.find(filter).select("email");
    if (targetUsers.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Koi user nahi mila!" });

    const emailList = targetUsers.map((u) => u.email);

    await sendEmail({
      authEmail: process.env.SEND_EMAIL_USER,
      authPass: process.env.SEND_EMAIL_PASS,
      brandName: process.env.BRAND_NAME || "BR30Trader Official",
      bcc: emailList,
      subject:
        subject ||
        (target === "vip"
          ? "💎 VIP Special Update"
          : "🔥 Special Discount for You"),
      html: finalHtml,
    });

    res.status(200).json({
      success: true,
      message: `${emailList.length} users ko ${discountValue}% discount ke sath mail bhej diya!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
//#endregion