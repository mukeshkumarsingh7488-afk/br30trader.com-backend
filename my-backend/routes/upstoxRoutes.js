const express = require('express');
const router = express.Router();
const axios = require('axios');

// 🔥 1. Upstox Login URL generate karein
router.get('/login', (req, res) => {
    const apiKey = process.env.UPSTOX_API_KEY;

    // ✅ Redirect URI from .env
    const redirectUri = encodeURIComponent(process.env.UPSTOX_REDIRECT_URI);

    // ✅ Upstox Login URL
    const url = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${apiKey}&redirect_uri=${redirectUri}`;

    res.redirect(url);
});

// 🔥 2. Callback URL (Upstox login ke baad yahan aayega)
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("❌ Login failed: No code received");
    }

    try {
        // ✅ Token API request
        const response = await axios.post(
            'https://api.upstox.com/v2/login/authorization/token',
            new URLSearchParams({
                code: code,
                client_id: process.env.UPSTOX_API_KEY,
                client_secret: process.env.UPSTOX_API_SECRET,
                redirect_uri: process.env.UPSTOX_REDIRECT_URI, // env se
                grant_type: 'authorization_code'
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        const accessToken = response.data.access_token;
        console.log("✅ Upstox Access Token:", accessToken);

        // 🔥 FUTURE: Is token ko DB ya memory me save karna
        res.send("✅ Upstox Connected Successfully!");
    } catch (err) {
        console.error("❌ Auth Error:", err.response?.data || err.message);
        res.status(500).send("❌ Authentication failed");
    }
});

module.exports = router;

