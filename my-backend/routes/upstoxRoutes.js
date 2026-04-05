const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculateOptionGreeks } = require('../utils/greeks');
const UpstoxToken = require('../models/UpstoxToken'); // Token DB se lene ke liye

// 🔥 1. Upstox Login URL generate karein
router.get('/login', (req, res) => {
    const apiKey = process.env.UPSTOX_API_KEY;

    // ✅ Redirect URI from .env
    const redirectUri = encodeURIComponent(process.env.UPSTOX_REDIRECT_URI);

    // ✅ Upstox Login URL
    const url = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${apiKey}&redirect_uri=${redirectUri}`;

    res.redirect(url);
});

// 🔥 2. Callback URL (Upstox login ke baad yahan aayega // Model import karein

router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("❌ Login failed: No code received");
    }

    try {
        // 1. Upstox se Access Token mangwayein
        const response = await axios.post(
            'https://api.upstox.com/v2/login/authorization/token',
            new URLSearchParams({
                code: code,
                client_id: process.env.UPSTOX_API_KEY,
                client_secret: process.env.UPSTOX_API_SECRET,
                redirect_uri: process.env.UPSTOX_REDIRECT_URI,
                grant_type: 'authorization_code'
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = response.data.access_token;

        // 2. 🔥 DB mein Token Save ya Update karein (Upsert logic)
        // Isse hamesha sirf EK hi document rahega DB mein jo update hota rahega
        await UpstoxToken.findOneAndUpdate(
            {},
            { accessToken: accessToken, updatedAt: Date.now() },
            { upsert: true, new: true }
        );

        console.log("✅ Upstox Token DB mein successfully save ho gaya!");

        // Frontend par confirmation dikhayein
        res.send(`
            <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
                <h1 style="color: #00ff88;">✅ Upstox Connected Successfully!</h1>
                <p>Ab aap Option Chain aur Greeks dekh sakte hain.</p>
                <script>setTimeout(() => { window.close(); }, 3000);</script>
            </div>
        `);

    } catch (err) {
        console.error("❌ Auth Error:", err.response?.data || err.message);
        res.status(500).send("❌ Authentication failed: " + (err.response?.data?.errors?.[0]?.message || err.message));
    }
});


// 🔥 3. Option Chain API (Example for NIFTY)

// 🛠️ Utility: Agli Expiry Date (Thursday) nikalne ke liye
const getNextExpiryDate = () => {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    // Thursday (4) tak kitne din bache hain
    let daysToThursday = (4 - day + 7) % 7;
    if (daysToThursday === 0 && today.getHours() >= 16) daysToThursday = 7; // Agar aaj Thursday sham hai toh agli wali lo

    const nextExpiry = new Date(today);
    nextExpiry.setDate(today.getDate() + daysToThursday);
    return nextExpiry.toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

router.get('/option-chain/:index', async (req, res) => {
    try {
        const { index } = req.params; // NIFTY, BANKNIFTY, FINNIFTY
        const expiryDate = getNextExpiryDate(); // 🔥 Dynamic Expiry logic

        // 1. 🔍 DB se latest Access Token uthao
        const tokenDoc = await UpstoxToken.findOne().sort({ updatedAt: -1 });
        if (!tokenDoc) {
            return res.status(401).json({ error: "Upstox not connected! Please login first." });
        }
        const accessToken = tokenDoc.accessToken;

        // 2. 🚀 Upstox API Call (Fixed URL & Correct Params)
        const response = await axios.get('https://api-v2.upstox.com/option-chain', {
            params: {
                instrument_key: `NSE_INDEX|${index === 'NIFTY' ? 'Nifty 50' : (index === 'BANKNIFTY' ? 'Nifty Bank' : 'Nifty Fin Service')}`,
                expiry_date: expiryDate
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        const chainData = response.data.data;
        if (!chainData || chainData.length === 0) {
            return res.status(404).json({ error: "No data found for this index/expiry" });
        }

        // Spot Price aksar pehle strike ke underlying data mein hoti hai
        const spotPrice = chainData[0]?.underlying_spot_price || 0;

        // 3. 🧠 Greeks Processing
        const proData = chainData.map(strike => {
            const expiryDays = 4; // DTE (Isse bhi dynamic kar sakte hain baad mein)

            return {
                strike_price: strike.strike_price,
                call: {
                    ltp: strike.call_options?.market_data?.ltp || 0,
                    iv: strike.call_options?.market_data?.iv || 0,
                    oi: strike.call_options?.market_data?.oi || 0,
                    ...calculateOptionGreeks(
                        spotPrice,
                        strike.strike_price,
                        expiryDays,
                        strike.call_options?.market_data?.iv || 20,
                        0.07,
                        'call'
                    )
                },
                put: {
                    ltp: strike.put_options?.market_data?.ltp || 0,
                    iv: strike.put_options?.market_data?.iv || 0,
                    oi: strike.put_options?.market_data?.oi || 0,
                    ...calculateOptionGreeks(
                        spotPrice,
                        strike.strike_price,
                        expiryDays,
                        strike.put_options?.market_data?.iv || 20,
                        0.07,
                        'put'
                    )
                }
            };
        });

        res.json({
            success: true,
            index: index,
            expiryDate: expiryDate,
            spotPrice: spotPrice,
            data: proData
        });

    } catch (err) {
        console.error("❌ Option Chain Error:", err.response?.data || err.message);
        res.status(500).json({
            error: "Backend Processing Error",
            details: err.response?.data?.errors?.[0]?.message || err.message
        });
    }
});



module.exports = router;

