const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculateOptionGreeks } = require('../utils/greeks');
const UpstoxToken = require('../models/UpstoxToken'); // Model direct import karo

// 🛠️ Utility: Agli Expiry Date (Thursday)
const getNextExpiryDate = () => {
    const today = new Date();
    const day = today.getDay(); 
    let daysToThursday = (4 - day + 7) % 7;
    if (daysToThursday === 0 && today.getHours() >= 16) daysToThursday = 7;
    const nextExpiry = new Date(today);
    nextExpiry.setDate(today.getDate() + daysToThursday);
    return nextExpiry.toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

// 🔥 Public Option Chain API
router.get('/option-chain/:index', async (req, res) => {
    try {
        const { index } = req.params;
        const expiryDate = getNextExpiryDate();

        // 1. DB se Latest Token uthao (getValidAccessToken ki jagah direct DB query for safety)
        const tokenDoc = await UpstoxToken.findOne().sort({ updatedAt: -1 });
        if (!tokenDoc) return res.status(401).json({ error: "Upstox not connected!" });

        const instrument = index === 'NIFTY' ? 'Nifty 50' :
            index === 'BANKNIFTY' ? 'Nifty Bank' :
                'Nifty Fin Service';

        // 2. ✅ ASLI URL (Upstox v2)
        const response = await axios.get('https://upstox.com', {
            params: {
                instrument_key: `NSE_INDEX|${instrument}`,
                expiry_date: expiryDate
            },
            headers: {
                'Authorization': `Bearer ${tokenDoc.accessToken}`,
                'Accept': 'application/json'
            }
        });

        const chainData = response.data.data;
        if (!chainData || chainData.length === 0) {
            return res.status(404).json({ error: "No data found for this index/expiry" });
        }

        // 3. Spot Price handle karo
        const spotPrice = response.data.underlying_spot_price || (chainData[0] ? chainData[0].underlying_spot_price : 0);

        const proData = chainData.map(strike => {
            const callIV = strike.call_options?.market_data?.iv || 15;
            const putIV = strike.put_options?.market_data?.iv || 15;

            return {
                strike_price: strike.strike_price,
                call: {
                    ltp: strike.call_options?.market_data?.ltp || 0,
                    iv: callIV,
                    oi: strike.call_options?.market_data?.oi || 0,
                    ...calculateOptionGreeks(spotPrice, strike.strike_price, 4, callIV, 0.07, 'call')
                },
                put: {
                    ltp: strike.put_options?.market_data?.ltp || 0,
                    iv: putIV,
                    oi: strike.put_options?.market_data?.oi || 0,
                    ...calculateOptionGreeks(spotPrice, strike.strike_price, 4, putIV, 0.07, 'put')
                }
            };
        });

        res.json({ success: true, index, expiryDate, spotPrice, data: proData });

    } catch (err) {
        console.error("❌ Option Chain Error:", err.response?.data || err.message);
        res.status(500).json({
            error: "Backend Processing Error",
            details: err.response?.data?.errors?.[0]?.message || err.message
        });
    }
});

module.exports = router;

