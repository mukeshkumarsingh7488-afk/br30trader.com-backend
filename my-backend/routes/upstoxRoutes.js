const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculateOptionGreeks } = require('../utils/greeks');
const UpstoxToken = require('../models/UpstoxToken');

/* ==========================================
   1. LOGIN SYSTEM (Iske bina token nahi milega)
   ========================================== */

// 🔑 A. User ko Upstox Login Page par bhejna
router.get('/login', (req, res) => {
    const apiKey = process.env.UPSTOX_API_KEY;
    const redirectUri = encodeURIComponent(process.env.UPSTOX_REDIRECT_URI);
    // Upstox Auth URL
    const url = `https://upstox.com{apiKey}&redirect_uri=${redirectUri}`;
    res.redirect(url);
});

// 🔑 B. Login ke baad Token receive aur DB mein save karna
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("❌ Login failed: No code received");

    try {
        const response = await axios.post('https://upstox.com', 
        new URLSearchParams({
            code: code,
            client_id: process.env.UPSTOX_API_KEY,
            client_secret: process.env.UPSTOX_API_SECRET,
            redirect_uri: process.env.UPSTOX_REDIRECT_URI,
            grant_type: 'authorization_code'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = response.data.access_token;

        // DB mein save/update (Hamesha ek hi doc rahega)
        await UpstoxToken.findOneAndUpdate({}, 
            { accessToken: accessToken, updatedAt: new Date() }, 
            { upsert: true, new: true }
        );

        res.send("<h1>✅ Upstox Connected Successfully!</h1><script>setTimeout(()=>window.close(), 2000)</script>");
    } catch (err) {
        console.error("❌ Callback Error:", err.response?.data || err.message);
        res.status(500).send("❌ Auth Failed");
    }
});

/* ==========================================
   2. OPTION CHAIN LOGIC
   ========================================== */

router.get('/option-chain/:index', async (req, res) => {
    try {
        const { index } = req.params;
        const tokenDoc = await UpstoxToken.findOne().sort({ updatedAt: -1 });

        if (!tokenDoc) return res.status(401).json({ success: false, error: "Connect Upstox First!" });

        const instrumentMap = { 
            'NIFTY': 'NSE_INDEX|Nifty 50', 
            'BANKNIFTY': 'NSE_INDEX|Nifty Bank' 
        };
        const instrumentKey = instrumentMap[index.toUpperCase()] || instrumentMap['NIFTY'];
        const expiryDate = "2026-04-09"; 

        // ✅ SAHI API URL (v2)
        const response = await axios.get('https://upstox.com', {
            params: { instrument_key: instrumentKey, expiry_date: expiryDate },
            headers: { 'Authorization': `Bearer ${tokenDoc.accessToken}`, 'Accept': 'application/json' }
        });

        const chainData = response.data?.data || [];
        if (chainData.length === 0) return res.status(404).json({ success: false, error: "No data found" });

        const spotPrice = response.data.underlying_spot_price || 0;

        const proData = chainData.map(strike => {
            const cIV = strike.call_options?.market_data?.iv || 15;
            const pIV = strike.put_options?.market_data?.iv || 15;
            return {
                strike_price: strike.strike_price,
                call: {
                    ltp: strike.call_options?.market_data?.ltp || 0,
                    oi: strike.call_options?.market_data?.oi || 0,
                    iv: cIV,
                    ...calculateOptionGreeks(spotPrice, strike.strike_price, 4, cIV, 0.07, 'call')
                },
                put: {
                    ltp: strike.put_options?.market_data?.ltp || 0,
                    oi: strike.put_options?.market_data?.oi || 0,
                    iv: pIV,
                    ...calculateOptionGreeks(spotPrice, strike.strike_price, 4, pIV, 0.07, 'put')
                }
            };
        });

        res.json({ success: true, spotPrice, expiryDate, data: proData });

    } catch (err) {
        console.error("❌ API Error:", err.response?.data || err.message);
        res.status(500).json({ success: false, error: "Upstox API Error", details: err.message });
    }
});

module.exports = router;
