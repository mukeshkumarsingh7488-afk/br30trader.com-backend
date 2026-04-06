//#region IMPORTS
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Course = require("../models/Course");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const sendEmail = require("../utils/sendEmail"); // 🔥 File ka sahi naam 'sendEmail' rakhein
//#endregion

//#region Rozorpay key_id And Key_Secret Process.env file
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
//#endregion

//#region Create Payment Order (Frontend se order create karne ke liye)
// Create payment order
exports.createOrder = async (req, res) => {
  try {
    const { courseId, couponCode } = req.body;
    const course = await Course.findById(courseId);

    if (!course) return res.status(404).json({ msg: "Course nahi mila" });

    let finalPrice = Number(course.price);
    let isApplied = false;

    // 🔥 COUPON VALIDATION LOGIC
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      console.log(`🔍 Checking Coupon in DB: "${cleanCode}"`);

      // 🛡️ FIX: isActive field database mein nahi hai, isliye sirf 'code' se dhoondo
      const validCoupon = await Coupon.findOne({
        code: cleanCode,
      });

      if (validCoupon) {
        // Calculation: Price - (Price * Discount / 100)
        const discountAmount =
          (finalPrice * Number(validCoupon.discount)) / 100;
        finalPrice = finalPrice - discountAmount;
        isApplied = true;
        console.log(
          `✅ Coupon Match! ${validCoupon.discount}% Discount Applied. New Price: ${finalPrice}`,
        );
      } else {
        console.log(`❌ Coupon "${cleanCode}" not found in DB.`);
      }
    }

    const options = {
      amount: Math.round(finalPrice * 100), // Razorpay Paisa format
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      order,
      finalPrice,
      discountApplied: isApplied,
      msg: isApplied ? "Coupon Applied!" : "Invalid or No Coupon",
    });
  } catch (err) {
    console.error("❌ RAZORPAY ERROR:", err.message);
    res.status(500).json({ msg: "Order Error", error: err.message });
  }
};
//#endregion

// #region Payment Verify (Frontend se payment verify karne ke liye)
// pement verify
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      amount, // 🔥 Naya: Frontend se total amount (paisa format)
      couponCode, // 🔥 Naya: Agar koi coupon use hua ho
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const user = await User.findById(req.user.id);

      // 1. Course Unlock & Auto-VIP Logic
      if (!user.purchasedCourses.includes(courseId)) {
        user.purchasedCourses.push(courseId);

        // ✨ AUTO-VIP: Course kharidte hi user VIP ban jaye
        user.isVip = true;
        user.badge = "vip";

        await user.save();
      }

      // 💰 2. SALES TRACKER: Kamayi ka hisab database mein save karo
      const newOrder = new Order({
        user: req.user.id,
        course: courseId,
        amount: amount / 100, // Razorpay se 840000 aayega, hum 8400 save karenge
        paymentId: razorpay_payment_id,
        couponUsed: couponCode || "NONE",
      });
      await newOrder.save();

      res.json({
        success: true,
        msg: "Payment Successful! Course & VIP Unlocked.",
        orderId: newOrder._id,
      });
    } else {
      res.status(400).json({ msg: "Invalid Signature!" });
    }
  } catch (err) {
    console.error("❌ Verify Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
//#endregion

// #region Payment Failure Alert Logic (Support Team & User ko alert bhejne ke liye)
// 🔥 NAYA SYSTEM: Payment Failure Alert Logic
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { courseId, reason } = req.body;

    // Pehle data mangwao
    const user = await User.findById(req.user.id);
    const course = await Course.findById(courseId);

    // Check karo ki data mila ya nahi
    if (!user || !course) {
      return res.status(404).json({ msg: "User ya Course nahi mila" });
    }

    // Ab console log sahi se kaam karega
    console.log("User Data Found:", user.name, user.email);
    console.log("Course Data Found:", course.title);

    // 1. Support Team ko Alert mail
    await sendEmail({
      authEmail: process.env.SUPPORT_EMAIL_USER,
      authPass: process.env.SUPPORT_EMAIL_PASS,
      brandName: "SYSTEM ALERT",
      email: process.env.SUPPORT_EMAIL_USER,
      subject: `⚠️ Payment Failed: ${user.name}`,
      html: `
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
</html>`,
    });

    // 2. User ko Help Mail
    await sendEmail({
      authEmail: process.env.SUPPORT_EMAIL_USER,
      authPass: process.env.SUPPORT_EMAIL_PASS,
      brandName: "BR30 TRADER Support",
      email: user.email,
      subject: `Need help with ${course.title}?`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
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
<a href="${process.env.WHATSAPP_LINK}" class="support-btn">
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

<a href="https://www.instagram.com" style="margin: 0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
</a>

<a href="https://t.me" style="margin: 0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
</a>

<a href="https://chat.whatsapp.com" style="margin: 0 10px;">
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
</body></html>`,
    });

    res.status(200).json({ success: true, msg: "Failure alerts sent!" });
  } catch (err) {
    console.error("❌ FAILURE ALERT ERROR:", err.message);
    res.status(500).json({ msg: "Alert Error", error: err.message });
  }
};
//#endregion