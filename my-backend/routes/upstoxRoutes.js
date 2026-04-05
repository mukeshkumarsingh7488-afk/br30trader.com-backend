const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculateOptionGreeks } = require('../utils/greeks');
const UpstoxToken = require('../models/UpstoxToken');

// 🔥 Get Latest Token from DB
router.get('/option-chain/:index', async (req, res) => {
    try {
        const { index } = req.params;
        const tokenDoc = await UpstoxToken.findOne().sort({ updatedAt: -1 });

        if (!tokenDoc) return res.status(401).json({ error: "Connect Upstox First!" });

        // 🚨 Date logic simple rakho aaj ke liye (Dynamic baad mein karenge)
        const expiryDate = "2026-04-09"; 

        const response = await axios.get('https://upstox.com', {
            params: {
                instrument_key: `NSE_INDEX|${index === 'NIFTY' ? 'Nifty 50' : 'Nifty Bank'}`,
                expiry_date: expiryDate
            },
            headers: { 'Authorization': `Bearer ${tokenDoc.accessToken}` }
        });

        // ✅ proData defined correctly
        const proData = response.data.data.map(strike => {
            const spot = response.data.underlying_spot_price || 0;
            const cIV = strike.call_options?.market_data?.iv || 15;
            const pIV = strike.put_options?.market_data?.iv || 15;

            return {
                strike_price: strike.strike_price,
                call: {
                    ltp: strike.call_options?.market_data?.ltp || 0,
                    oi: strike.call_options?.market_data?.oi || 0,
                    iv: cIV,
                    ...calculateOptionGreeks(spot, strike.strike_price, 4, cIV, 0.07, 'call')
                },
                put: {
                    ltp: strike.put_options?.market_data?.ltp || 0,
                    oi: strike.put_options?.market_data?.oi || 0,
                    iv: pIV,
                    ...calculateOptionGreeks(spot, strike.strike_price, 4, pIV, 0.07, 'put')
                }
            };
        });

        res.json({ success: true, spotPrice: response.data.underlying_spot_price, data: proData });

    } catch (err) {
        console.error("❌ API Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Upstox API Error" });
    }
});

module.exports = router;

