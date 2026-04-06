const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

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
    folder: "course_thumbnails", // Cloudinary par ye folder ban jayega
    public_id: (req, file) => {
      // 🎯 Sabse zaroori: Course ID ko filename banana
      // Isse purani file hamesha REPLACE hogi!
      return req.params.id; 
    },
    format: async (req, file) => "jpg", // Sab image JPG ban jayengi
  },
});

const uploadCloud = multer({ storage: storage });

module.exports = uploadCloud;
