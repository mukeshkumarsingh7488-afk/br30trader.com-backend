const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculateOptionGreeks } = require('../utils/greeks');
const UpstoxToken = require('../models/UpstoxToken');

// 💡 Redirect URI ko variable mein rakha hai taaki dono jagah same rahe
// 🚨 IMPORTANT: Ye exact URL tumhare Upstox Dashboard mein "Redirect URI" mein hona chahiye
const REDIRECT_URI = "https://my-backend-1-avpd.onrender.com/api/upstox/callback";

// 1. 🔑 LOGIN ROUTE
router.get('/login', (req, res) => {
    const apiKey = process.env.UPSTOX_API_KEY;
    
    // ✅ FIXED: Sahi Auth URL aur query parameters
    const url = `https://upstox.com{apiKey}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    
    console.log("🚀 Redirecting to Upstox Login...");
    res.redirect(url);
});

// 2. 🔑 CALLBACK ROUTE
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.status(400).send("❌ No code received from Upstox");
    }

    try {
        // ✅ FIXED: Sahi Token URL (v2 API)
        const response = await axios.post('https://upstox.com', 
        new URLSearchParams({
            code: code,
            client_id: process.env.UPSTOX_API_KEY,
            client_secret: process.env.UPSTOX_API_SECRET,
            redirect_uri: REDIRECT_URI, // ✅ FIXED: Same as dashboard
            grant_type: 'authorization_code'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }
        });

        const token = response.data.access_token;
        
        // DB mein save/update karo
        await UpstoxToken.findOneAndUpdate({}, 
            { accessToken: token, updatedAt: Date.now() }, 
            { upsert: true, new: true }
        );

        res.send("<h1>✅ Connected Successfully!</h1><p>Ab aap tab close kar sakte hain.</p><script>setTimeout(()=>window.close(), 2000)</script>");
    } catch (err) {
        console.error("❌ Callback Error Details:", err.response?.data || err.message);
        res.status(500).json({ 
            error: "Login Failed", 
            details: err.response?.data || err.message 
        });
    }
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
