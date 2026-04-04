//#region Upload Middleware
// Ye middleware multer ka configuration karega, taki hum user profile photos ko handle kar sakein. 
// Isme hum storage location, file naming convention, aur file type filter set karenge.
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* --------------------------------------------------------------------------
   1. STORAGE CONFIGURATION (UserID Based Naming)
   -------------------------------------------------------------------------- */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // process.cwd() hamesha project ke main folder (demo.b) ko pakdega
    const uploadPath = path.join(process.cwd(), "uploads");

    // Agar 'uploads' folder nahi hai toh ye line usey bana degi
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    // UserID ke naam se file save hogi (Example: 65fc123.png)
    // Isse purani photo automatic replace ho jayegi
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${req.user.id}${ext}`;
    cb(null, fileName);
  },
});

/* --------------------------------------------------------------------------
   2. FILE FILTER (Security Check)
   -------------------------------------------------------------------------- */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Bhai, sirf Images (JPG, PNG, GIF) hi allow hain!"));
  }
};

/* --------------------------------------------------------------------------
   3. INITIALIZE MULTER
   -------------------------------------------------------------------------- */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // Max 2MB file limit
});

module.exports = upload;
//#endregion