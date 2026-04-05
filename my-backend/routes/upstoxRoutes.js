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

        if (!tokenDoc) return res.status(401).json({ success: false, error: "Connect Upstox First!" });

        const instrumentMap = { 'NIFTY': 'NSE_INDEX|Nifty 50', 'BANKNIFTY': 'NSE_INDEX|Nifty Bank' };
        const instrumentKey = instrumentMap[index.toUpperCase()] || instrumentMap['NIFTY'];
        
        // 🚨 Date check: Sunday ko shayad 07 ya 09 mang raha ho
        const expiryDate = "2026-04-09"; 

        const response = await axios.get('https://upstox.com', {
            params: { instrument_key: instrumentKey, expiry_date: expiryDate },
            headers: { 'Authorization': `Bearer ${tokenDoc.accessToken}`, 'Accept': 'application/json' }
        });

        // ✅ SAFETY CHECK: Agar data undefined hai toh khali array dalo
        const chainData = response.data?.data || [];
        
        if (chainData.length === 0) {
            return res.status(404).json({ success: false, error: "No data found for this expiry" });
        }

        const spotPrice = response.data.underlying_spot_price || 0;

        // ✅ proData processing
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

