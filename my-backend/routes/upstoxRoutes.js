const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculateOptionGreeks } = require('../utils/greeks');
const UpstoxToken = require('../models/UpstoxToken'); // Model direct import karo

// 🛠️ Utility: Agli Expiry Date (Thursday)
// ✅ Smart Function: Har Index ke liye Agli Expiry (Automatic)
const getAutoExpiryDate = (index) => {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Nifty ki Expiry Thursday (4) ko hoti hai
    // Bank Nifty ki Expiry Wednesday (3) ko hoti hai
    let targetDay = (index === 'BANKNIFTY') ? 3 : 4; 

    let daysToExpiry = (targetDay - day + 7) % 7;
    
    // Agar aaj hi expiry hai aur market band ho gaya (3:30 PM ke baad), toh agli wali lo
    if (daysToExpiry === 0 && today.getHours() >= 16) {
        daysToExpiry = 7;
    }

    const nextExpiry = new Date(today);
    nextExpiry.setDate(today.getDate() + daysToExpiry);
    
    // Format: YYYY-MM-DD
    return nextExpiry.toISOString().split('T')[0];
};

router.get('/option-chain/:index', async (req, res) => {
    try {
        const { index } = req.params;
        const expiryDate = getAutoExpiryDate(index.toUpperCase()); // 🔥 AUTO DATE!

        const instrumentMap = {
            'NIFTY': 'NSE_INDEX|Nifty 50',
            'BANKNIFTY': 'NSE_INDEX|Nifty Bank',
            'FINNIFTY': 'NSE_INDEX|Nifty Fin Service'
        };
        const instrumentKey = instrumentMap[index.toUpperCase()] || instrumentMap['NIFTY'];

        const tokenDoc = await UpstoxToken.findOne().sort({ updatedAt: -1 });
        if (!tokenDoc) return res.status(401).json({ success: false, error: "Connect Upstox!" });

        console.log(`🚀 Fetching Data for ${instrumentKey} | Expiry: ${expiryDate}`);

        const response = await axios.get('https://upstox.com', {
            params: {
                instrument_key: instrumentKey,
                expiry_date: expiryDate
            },
            headers: { 'Authorization': `Bearer ${tokenDoc.accessToken}`, 'Accept': 'application/json' }
        });

        // ... baaki ka Greeks processing logic ...
        res.json({ success: true, spotPrice: response.data.underlying_spot_price || 0, expiryDate, data: proData });

    } catch (err) {
        console.error("❌ API Error:", err.response?.data || err.message);
        res.status(500).json({ success: false, error: "Dynamic Fetch Failed", details: err.message });
    }
});


module.exports = router;

