const axios = require('axios');
const UpstoxToken = require('../models/UpstoxToken');

const getValidAccessToken = async () => {
    let tokenDoc = await UpstoxToken.findOne().sort({ updatedAt: -1 });
    if (!tokenDoc) throw new Error('Upstox token not found. Please set up the service account manually once.');

    const now = new Date();
    // Agar token expire hone wala hai (5 min buffer)
    if (now >= tokenDoc.expiresAt || !tokenDoc.accessToken) {
        console.log("🔄 Access token expired, refreshing...");
        const refreshResp = await axios.post(
            'https://api.upstox.com/v2/login/authorization/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: tokenDoc.refreshToken,
                client_id: process.env.UPSTOX_API_KEY,
                client_secret: process.env.UPSTOX_API_SECRET
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token, expires_in, refresh_token } = refreshResp.data;

        // Update DB
        tokenDoc.accessToken = access_token;
        tokenDoc.refreshToken = refresh_token || tokenDoc.refreshToken;
        tokenDoc.expiresAt = new Date(Date.now() + expires_in * 1000); // expires_in seconds
        tokenDoc.updatedAt = new Date();
        await tokenDoc.save();

        return access_token;
    }

    return tokenDoc.accessToken;
};

module.exports = { getValidAccessToken };