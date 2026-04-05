const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculateOptionGreeks } = require('../utils/greeks');
const UpstoxToken = require('../models/UpstoxToken');

// 1️⃣ Next Thursday Expiry
const getNextExpiryDate = () => {
    const today = new Date();
    const day = today.getDay();
    let daysToThursday = (4 - day + 7) % 7;
    if (daysToThursday === 0 && today.getHours() >= 16) daysToThursday = 7;
    const nextExpiry = new Date(today);
    nextExpiry.setDate(today.getDate() + daysToThursday);
    return nextExpiry.toISOString().split('T')[0];
};

// 2️⃣ Upstox Login URL
router.get('/login', (req, res) => {
    const apiKey = process.env.UPSTOX_API_KEY;
    const redirectUri = encodeURIComponent(process.env.UPSTOX_REDIRECT_URI);
    const url = `https://api-upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${apiKey}&redirect_uri=${redirectUri}`;
    res.redirect(url);
});

// 3️⃣ Callback & Token Save
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("❌ Login failed: No code received");

    try {
        const response = await axios.post(
            'https://api-v2.upstox.com/login/authorization/token',
            new URLSearchParams({
                code,
                client_id: process.env.UPSTOX_API_KEY,
                client_secret: process.env.UPSTOX_API_SECRET,
                redirect_uri: process.env.UPSTOX_REDIRECT_URI,
                grant_type: 'authorization_code'
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = response.data.access_token;
        await UpstoxToken.findOneAndUpdate({}, { accessToken, updatedAt: new Date() }, { upsert: true, new: true });
        console.log("✅ Token saved:", accessToken.slice(0, 10) + '...');

        res.send(`<h1 style="text-align:center;color:#00ff88;">✅ Upstox Connected Successfully!</h1><script>setTimeout(()=>window.close(),3000)</script>`);
    } catch (err) {
        console.error("❌ Auth Error:", err.response?.data || err.message);
        res.status(500).send("❌ Authentication failed: " + (err.response?.data?.errors?.[0]?.message || err.message));
    }
});

// 4️⃣ Option Chain Fetch
router.get('/option-chain/:index', async (req, res) => {
    try {
        const { index } = req.params;
        const expiryDate = getNextExpiryDate();

        const tokenDoc = await UpstoxToken.findOne().sort({ updatedAt: -1 });
        if (!tokenDoc) return res.status(401).json({ error: "Upstox not connected" });

        const accessToken = tokenDoc.accessToken;
        const instrumentMap = { NIFTY: 'Nifty 50', BANKNIFTY: 'Nifty Bank', FINNIFTY: 'Nifty Fin Service' };
        const instrumentKey = `NSE_INDEX|${instrumentMap[index] || 'Nifty 50'}`;

        const response = await axios.get('https://api-v2.upstox.com/option-chain', {
            params: { instrument_key: instrumentKey, expiry_date: expiryDate },
            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
        });

        const chainData = response.data.data;
        if (!chainData || chainData.length === 0) return res.status(404).json({ error: "No data found" });

        const spotPrice = chainData[0]?.underlying_spot_price || 0;

        const proData = chainData.map(strike => ({
            strike_price: strike.strike_price,
            call: { ltp: strike.call_options?.market_data?.ltp || 0, iv: strike.call_options?.market_data?.iv || 0, oi: strike.call_options?.market_data?.oi || 0, ...calculateOptionGreeks(spotPrice, strike.strike_price, 4, strike.call_options?.market_data?.iv || 20, 0.07, 'call') },
            put: { ltp: strike.put_options?.market_data?.ltp || 0, iv: strike.put_options?.market_data?.iv || 0, oi: strike.put_options?.market_data?.oi || 0, ...calculateOptionGreeks(spotPrice, strike.strike_price, 4, strike.put_options?.market_data?.iv || 20, 0.07, 'put') }
        }));

        res.json({ success: true, index, expiryDate, spotPrice, data: proData });
    } catch (err) {
        console.error("❌ Option Chain Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Backend Processing Error", details: err.response?.data?.errors?.[0]?.message || err.message });
    }
});

module.exports = router;

