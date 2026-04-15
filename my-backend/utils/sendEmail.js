//#region Send Email Utility
// Ye utility function humare email sending ke liye hai. Isme hum ndm ka use karke apne application se emails bhejenge.
// Jab bhi hume user ko koi notification, confirmation, ya congratulatory email bhejna hoga, toh hum is utility ka use karenge, jisse humara email sending process simple aur efficient ho jayega.
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

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

module.exports = sendEmail;

//#endregion
