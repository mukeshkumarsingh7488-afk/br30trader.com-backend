const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// 1. Cloudinary Config (Environment variables use ho rahe hain)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// 2. Storage Setup (Har course ke liye unique ID)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "course_thumbnails",
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) => {
      return `course_${Date.now()}`;
    },
  },
});

const uploadCloud = multer({ storage: storage });

console.log("✅ Multer Cloudinary Ready");

module.exports = uploadCloud;




