//#region Upload Middleware (Cloudinary Version)

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/* --------------------------------------------------------------------------
   1. STORAGE CONFIGURATION (Cloudinary)
-------------------------------------------------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pics", // Cloudinary me folder banega
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) => {
      return req.user.id; // same user ki photo replace ho jayegi
    },
  },
});

/* --------------------------------------------------------------------------
   2. INITIALIZE MULTER
-------------------------------------------------------------------------- */
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

module.exports = upload;

//#endregion