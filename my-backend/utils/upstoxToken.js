const UpstoxToken = require('../models/UpstoxToken');

// Isme koi Axios call mat rakho, sirf DB se latest token uthao
const getValidAccessToken = async () => {
    try {
        const tokenDoc = await UpstoxToken.findOne().sort({ updatedAt: -1 });
        if (!tokenDoc) return null;
        
        // Upstox token 24 hours ke liye valid hota hai
        // Agar token 24 ghante se purana hai, toh null return karo taaki frontend login bole
        const isExpired = (new Date() - new Date(tokenDoc.updatedAt)) > (24 * 60 * 60 * 1000);
        
        return isExpired ? null : tokenDoc.accessToken;
    } catch (err) {
        console.error("Token Fetch Error:", err);
        return null;
    }
};

module.exports = { getValidAccessToken };
