const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getValidAccessToken } = require("../utils/upstoxToken");
const { calculateOptionGreeks } = require('../utils/greeks');
const UpstoxToken = require('../models/UpstoxToken');

// -----------------------------
// 1️⃣ LOGIN ROUTE
// -----------------------------
router.get("/login", (req, res) => {
    const apiKey = process.env.UPSTOX_API_KEY;
    const redirectUri = process.env.REDIRECT_URI;

    // ✅ Correct Upstox OAuth URL
    const url = `https://api.upstox.com/login/oauth2/authorize?apiKey=${apiKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

    console.log("🚀 [LOGIN ROUTE] Redirecting user to Upstox login page...");
    console.log("🔗 Redirect URL:", url);

    res.redirect(url);
});

// -----------------------------
// 2️⃣ CALLBACK ROUTE
// -----------------------------
router.get("/callback", async (req, res) => {
    const { code } = req.query;
    console.log("🚀 [CALLBACK ROUTE] Code received from Upstox:", code);

    if (!code) {
        console.log("❌ [CALLBACK ROUTE] No code received from Upstox");
        return res.status(400).send("❌ No code received from Upstox");
    }

    try {
        console.log("⏳ Exchanging code for access token...");
        const response = await axios.post(
            "https://api.upstox.com/login/oauth2/token",
            new URLSearchParams({
                code,
                client_id: process.env.UPSTOX_API_KEY,
                client_secret: process.env.UPSTOX_API_SECRET,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: "authorization_code"
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const token = response.data.access_token;
        console.log("✅ Access token received:", token);

        // 🔹 Save / Update token in DB
        await UpstoxToken.findOneAndUpdate(
            {},
            { accessToken: token, updatedAt: Date.now() },
            { upsert: true, new: true }
        );
        console.log("💾 Access token saved/updated in DB successfully!");

        res.send("<h1>✅ Connected Successfully!</h1><p>You can close this tab now.</p><script>setTimeout(()=>window.close(),2000)</script>");
    } catch (err) {
        console.error("❌ [CALLBACK ROUTE] Error exchanging code for token:", err.response?.data || err.message);
        res.status(500).json({ error: "Login Failed", details: err.response?.data || err.message });
    }
});

// -----------------------------
// 3️⃣ TOKEN CHECK ROUTE (Optional, for frontend/debug)
// -----------------------------
router.get("/check-token", async (req, res) => {
    console.log("🔍 [CHECK TOKEN ROUTE] Fetching latest token from DB...");
    const tokenData = await getValidAccessToken();

    if (!tokenData) {
        console.log("❌ [CHECK TOKEN ROUTE] Token expired or not found");
        return res.status(401).json({ message: "❌ Token expired or not found, please login." });
    }

    console.log("✅ [CHECK TOKEN ROUTE] Valid token found:", tokenData.token);
    res.json({ accessToken: tokenData.token, payload: tokenData.decoded });
});

// 🔥 C. OPTION CHAIN (PRO LEVEL)
router.get('/option-chain/:index', async (req, res) => {
    try {
        const { index } = req.params;
        const tokenDoc = await UpstoxToken.findOne().sort({ updatedAt: -1 });

        if (!tokenDoc) return res.status(401).json({ error: "Please Login First" });

        // ✅ Instrument Key Setup
        const instrumentKey = index.toUpperCase() === 'NIFTY' ? 'NSE_INDEX|Nifty 50' : 'NSE_INDEX|Nifty Bank';

        // 🚨 Note: Ye date market ke hisaab se valid honi chahiye (Next Expiry)
        const expiryDate = "2026-04-09";

        const response = await axios.get('https://api.upstox.com/v2/option/chain', {
            params: { instrument_key: instrumentKey, expiry_date: expiryDate },
            headers: {
                'Authorization': `Bearer ${tokenDoc.accessToken}`,
                'Accept': 'application/json'
            }
        });

        const chainData = response.data?.data || [];
        if (chainData.length === 0) return res.status(404).json({ success: false, error: "No data found for this expiry" });

        const spot = response.data.underlying_spot_price || 0;

        const proData = chainData.map(strike => {
            const cIV = strike.call_options?.market_data?.iv || 15;
            const pIV = strike.put_options?.market_data?.iv || 15;

            // Days to expiry calculate karne ka logic yahan daal sakte ho (abhi default 4 hai)
            const dte = 4;

            return {
                strike_price: strike.strike_price,
                call: {
                    ltp: strike.call_options?.market_data?.ltp || 0,
                    oi: strike.call_options?.market_data?.oi || 0,
                    ...calculateOptionGreeks(spot, strike.strike_price, dte, cIV, 0.07, 'call')
                },
                put: {
                    ltp: strike.put_options?.market_data?.ltp || 0,
                    oi: strike.put_options?.market_data?.oi || 0,
                    ...calculateOptionGreeks(spot, strike.strike_price, dte, pIV, 0.07, 'put')
                }
            };
        });

        res.json({
            success: true,
            spotPrice: spot,
            expiryDate,
            index: index.toUpperCase(),
            data: proData
        });

    } catch (err) {
        console.error("❌ Option Chain Error:", err.response?.data || err.message);
        res.status(500).json({ error: "API Error", details: err.response?.data || err.message });
    }
});

module.exports = router;
