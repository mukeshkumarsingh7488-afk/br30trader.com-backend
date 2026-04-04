// Whatsapp pe payment fail hone par message bhejne ke liye route
// 🔥 FUTURE FEATURE: Dynamic WhatsApp Link (Currently not in use)
router.post("/whatsapp-link", (req, res) => {
  const { name, email, course } = req.body;

  const number = process.env.WHATSAPP_NUMBER;

  const message = `Hi BR30 Team, mera payment fail ho gaya hai.

Name: ${name}
Email: ${email}
Course: ${course}

Please help me retry.`;

  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  res.json({ success: true, url });
});