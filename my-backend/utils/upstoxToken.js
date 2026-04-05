const UpstoxToken = require("../models/UpstoxToken");
const jwt = require("jsonwebtoken");

// Fetch latest token and check expiry
const getValidAccessToken = async () => {
    try {
        console.log("🔍 [TOKEN HELPER] Fetching latest token from DB...");
        const tokenDoc = await UpstoxToken.findOne().sort({ updatedAt: -1 });

        if (!tokenDoc) {
            console.log("❌ [TOKEN HELPER] No token found in DB");
            return null;
        }

        const ageMs = new Date() - new Date(tokenDoc.updatedAt);
        const isExpired = ageMs > 24 * 60 * 60 * 1000;
        console.log(`⏱ [TOKEN HELPER] Token age: ${ageMs / 1000}s (${isExpired ? "Expired" : "Valid"})`);

        if (isExpired) return null;

        // Decode payload safely (no verification)
        const decoded = jwt.decode(tokenDoc.accessToken);
        console.log("📝 [TOKEN HELPER] Decoded token payload:", decoded);

        return { token: tokenDoc.accessToken, decoded };
    } catch (err) {
        console.error("❌ [TOKEN HELPER] Token Fetch Error:", err);
        return null;
    }
};

module.exports = { getValidAccessToken };
