//#region Send Email Utility
// Ye utility function humare email sending ke liye hai. Isme hum nodemailer ka use karke apne application se emails bhejenge. 
// Jab bhi hume user ko koi notification, confirmation, ya congratulatory email bhejna hoga, toh hum is utility ka use karenge, jisse humara email sending process simple aur efficient ho jayega.
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: options.authEmail,
      pass: options.authPass,
    },
  });

  const mailOptions = {
    from: `"${options.brandName}" <${options.authEmail}>`,
    to: options.email || null,
    bcc: options.bcc || null,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
//#endregion