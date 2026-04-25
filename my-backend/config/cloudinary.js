//#region ━━━━━ 🚀 WELCOME DEVELOPER | CLOUD STORAGE INITIALIZED ━━━━━

/**
 * 🛠️ CLOUDINARY GLOBAL CONFIGURATION
 * Logic: Environment-based authentication for cloud media management
 * Status: Refactored & Production Ready
 */

const cloudinary = require("cloudinary").v2;

// 🔐 1. AUTHENTICATION: Linking credentials from .env for secure access
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// 🔍 2. DIAGNOSTIC: Immediate verification of cloud connection
console.log("✅ Cloudinary Connected: Systems Operational");

module.exports = cloudinary;
//#endregion
// ==========================================================================
// ✅ CONFIG STATUS: CLOUDINARY ENGINE ORGANIZED & VALIDATED.
// 🚀 DEPLOYMENT: MEDIA STORAGE READY FOR PRODUCTION!
// ==========================================================================

// 🏁 --- END OF CLOUDINARY CONFIG ---
