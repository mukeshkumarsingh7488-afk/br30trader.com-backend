const express = require('express');
const router = express.Router();
const axios = require('axios');

// 1. Upstox Login URL generate karein
router.get('/login', (req, res) => {
    const apiKey = process.env.UPSTOX_API_KEY;
    // Render Redirect URL
    const redirectUri = encodeURIComponent("https://onrender.com");
    const url = `https://upstox.com{apiKey}&redirect_uri=${redirectUri}`;
    
    res.redirect(url);
});

// 2. Callback URL (Upstox login ke baad yahan aayega)
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) return res.status(400).send("Login failed: No code received");

    try {
        const response = await axios.post('https://upstox.com', 
        new URLSearchParams({
            code: code,
            client_id: process.env.UPSTOX_API_KEY,
            client_secret: process.env.UPSTOX_API_SECRET,
            redirect_uri: "https://onrender.com",
            grant_type: 'authorization_code'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = response.data.access_token;
        console.log("✅ Upstox Access Token:", accessToken);
        
        // Is token ko save karna hoga (Abhi ke liye display kar rahe hain)
        res.send(`Upstox Connected! Token: ${accessToken}`);
    } catch (err) {
        console.error("❌ Auth Error:", err.response?.data || err.message);
        res.status(500).send("Authentication failed");
    }
});

module.exports = router;

