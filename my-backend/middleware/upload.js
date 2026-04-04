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
    folder: "profile_pics",
    allowed_formats: ["jpg", "png", "jpeg"],
    // Important: resource_type aur overwrite add karo
    resource_type: "image", 
    public_id: (req, file) => {
      // Isse file ka naam user ID ban jayega
      return req.user.id; 
    },
    overwrite: true, // Nayi upload purani wali ko replace kar degi
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