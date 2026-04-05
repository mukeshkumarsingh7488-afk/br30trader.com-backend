const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculateOptionGreeks } = require('../utils/greeks');
const { getValidAccessToken } = require('../utils/upstoxToken');

// 🛠️ Utility: Agli Expiry Date (Thursday)
const getNextExpiryDate = () => {
    const today = new Date();
    const day = today.getDay(); // 0=Sun .. 6=Sat
    let daysToThursday = (4 - day + 7) % 7;
    if (daysToThursday === 0 && today.getHours() >= 16) daysToThursday = 7;
    const nextExpiry = new Date(today);
    nextExpiry.setDate(today.getDate() + daysToThursday);
    return nextExpiry.toISOString().split('T')[0];
};

// 🔥 Public Option Chain API
router.get('/option-chain/:index', async (req, res) => {
    try {
        const { index } = req.params; // NIFTY, BANKNIFTY, FINNIFTY
        const expiryDate = getNextExpiryDate();

        const accessToken = await getValidAccessToken(); // ✅ Automatic token refresh

        const instrument = index === 'NIFTY' ? 'Nifty 50' :
            index === 'BANKNIFTY' ? 'Nifty Bank' :
                'Nifty Fin Service';

        const response = await axios.get('https://api-v2.upstox.com/option-chain', {
            params: {
                instrument_key: `NSE_INDEX|${instrument}`,
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

        const spotPrice = chainData[0]?.underlying_spot_price || 0;

        const proData = chainData.map(strike => {
            const expiryDays = 4; // DTE
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
            index,
            expiryDate,
            spotPrice,
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
