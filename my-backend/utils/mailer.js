//#region Mailer Utility
// Ye utility humare email sending ke liye hai. Isme hum nodemailer ka use karke apne application se emails bhejenge. 
// Jab bhi hume user ko koi notification, confirmation, ya congratulatory email bhejna hoga, toh hum is utility ka use karenge, jisse humara email sending process simple aur efficient ho jayega.
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;
//#endregion