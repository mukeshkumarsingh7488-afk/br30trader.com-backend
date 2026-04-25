//#region ━━━━━ 🚀 WELCOME DEVELOPER | MEDIA UPLOAD SYSTEM INITIALIZED ━━━━━
/**
 * 📁 CLOUDINARY STORAGE MIDDLEWARE
 * Logic: Multi-part Data Parsing & Automated Cloudinary Asset Routing
 * Purpose: Securely handling course thumbnails and user avatars
 * Status: 2026 Production Ready | Optimized for Asset Management
 * --------------------------------------------------------------------------
 */
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "course_thumbnails",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
//#endregion
// ==========================================================================
// ✅ STORAGE STATUS: MULTER-CLOUDINARY ENGINE ORGANIZED & TESTED.
// ☁️ CLOUD SYNC: FOLDER ROUTING & FORMAT VALIDATION ACTIVE.
// 🚀 DEPLOYMENT: READY FOR DYNAMIC MEDIA UPLOADS!
// ==========================================================================
