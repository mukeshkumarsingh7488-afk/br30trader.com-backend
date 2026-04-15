//#region Mailer Utility (RESEND VERSION)
// Ye utility humare email sending ke liye hai. Ab hum Resend API ka use kar rahe hain
// taaki Render aur Atlas pe connection timeout ka issue na aaye.
require("dotenv").config();
const { Resend } = require("resend");

// ✅ Resend setup (Ab ye transporter ki jagah kaam karega)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 📧 Central SendEmail Function
 * Isse tum pure project mein kahin bhi call kar sakte ho.
 */
const sendEmail = async (options) => {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // Testing ke liye fix rakho
      to: options.email,
      subject: options.subject,
      html: options.message,
    });
    console.log("✅ Email sent successfully:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Resend Utility Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
//#endregion
