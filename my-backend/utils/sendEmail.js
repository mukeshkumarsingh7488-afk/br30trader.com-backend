//#region Send Email Utility
// Ye utility function humare email sending ke liye hai. Isme hum nodemailer ka use karke apne application se emails bhejenge. 
// Jab bhi hume user ko koi notification, confirmation, ya congratulatory email bhejna hoga, toh hum is utility ka use karenge, jisse humara email sending process simple aur efficient ho jayega.
const { Resend } = require('resend');

// Dashboard se li gayi API Key yahan process.env se aayegi
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev', // Shuruat mein yahi rehne do (Testing ke liye)
            to: options.email,
            subject: options.subject,
            html: options.message, // Tera purana HTML template yahan kaam karega
        });
        console.log("Email sent successfully via Resend API!");
    } catch (error) {
        console.error("Resend Error:", error);
    }
};

module.exports = sendEmail;

//#endregion