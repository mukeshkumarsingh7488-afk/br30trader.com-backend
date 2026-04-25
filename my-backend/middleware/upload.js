//#region ━━━━━ 🚀 WELCOME DEVELOPER | CLOUD UPLOAD ENGINE INITIALIZED ━━━━━
/**
 * 📦 UPLOAD MIDDLEWARE (CLOUDINARY VERSION)
 * Logic: Streamlined Multi-part Form Data Processing & Cloud Sync
 * Features: Automatic Folder Routing, Format Filtering & Secure Asset Storage
 * Status: 2026 Production Ready | MSR PRO Media Architecture
 * --------------------------------------------------------------------------
 */

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/* --------------------------------------------------------------------------
   1. STORAGE CONFIGURATION (Cloudinary)
-------------------------------------------------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pics",
    allowed_formats: ["jpg", "png", "jpeg"],

    resource_type: "image",
    public_id: (req, file) => {
      return req.user.id;
    },
    overwrite: true,
  },
});

/* --------------------------------------------------------------------------
   2. INITIALIZE MULTER
-------------------------------------------------------------------------- */
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = upload;

//#endregion
// ==========================================================================
// ✅ UPLOAD STATUS: CLOUDINARY MIDDLEWARE ORGANIZED & REFACTORED.
// ☁️ ASSET INTEGRITY: MEDIA STORAGE & FOLDER SYNC FULLY OPERATIONAL.
// 🚀 DEPLOYMENT: UPLOAD ENGINE READY FOR HIGH-RESOLUTION CONTENT!
// ==========================================================================
