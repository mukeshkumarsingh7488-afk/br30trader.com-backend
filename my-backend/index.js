//#region MAIN SERVER FILE
// Ye file humare server ka entry point hai. Isme hum Express app ko setup karenge, database se connect karenge, aur saare routes ko register karenge. 
// Jab bhi hum server start karenge, toh yeh file execute hoke humare backend ko ready karegi, taki hum API requests ko handle kar sakein aur apne application ke features ko serve kar sakein.
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
dotenv.config();
const app = express();
const cors = require("cors");
const path = require("path");
const http = require("http");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const tradeRoutes = require("./routes/trades");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notifications");
const adminEmailRoutes = require("./routes/adminEmailRoutes");
const User = require("./models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");


// HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5500", // Local testing ke liye 
      "https://my-frontend-eight-roan.vercel.app" // 👈 Apna asli Vercel link 
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track live users
let liveUsers = 0;

// Socket events
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  liveUsers++;

  // Emit live user count to all clients
  io.emit("live_users_count", liveUsers);

  // Listen for user joining a "room" (e.g., by userId)
  socket.on("join", (userId) => {
    console.log("User joined room:", userId);
    socket.join(userId);
  });

  // Example: backend notification trigger
  socket.on("send_notification", ({ userId, message }) => {
    console.log("Sending notification to", userId);
    io.to(userId).emit("notification", { message });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    liveUsers--;
    io.emit("live_users_count", liveUsers);
  });
});
// =============================

// 1. Middlewares (Order Sahi Rakha Hai)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], 
    credentials: true,
  }),
);


app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "demo.f")));

// 2. Database Connect
connectDB();

// 3. Socket.io Logic
app.set("socketio", io);
io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);
  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", socket.id);
  });
});

// 4. API Routes
app.use("/api/admin/email", adminEmailRoutes);
app.use("/certificates", express.static("certificates"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/trades", require("./routes/trades"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/certificates", express.static(path.join(__dirname, "certificates")));


// 5. Basic Routes
app.get("/", (req, res) => {
  res.send("Server is Working!");
});

// 6. Push Notification Token Save API
app.post("/api/save-fcm-token", async (req, res) => {
  const { userId, token } = req.body;

  console.log("🚀 Request aayi User ID:", userId);
  console.log("🚀 Token aaya:", token);

  try {
    if (!userId || !token) {
      return res
        .status(400)
        .json({ msg: "Bhai, UserId ya Token missing hai!" });
    }

    // Database mein update karo (Sirf EK BAAR)
    const result = await User.findByIdAndUpdate(
      userId,
      { fcmToken: token },
      { new: true },
    );

    if (!result) {
      console.log("❌ User nahi mila DB mein! ID check karo.");
      return res.status(404).json({ msg: "User nahi mila!" });
    }

    console.log("✅ Asali Token Database mein Save ho gaya!");
    res.status(200).json({ msg: "Success! Token saved." });
  } catch (err) {
    console.error("❌ Save Token Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 7. Admin Send All Notification API
app.post("/api/admin/send-all", async (req, res) => {
  const { title, message } = req.body;
  console.log("🚀 Admin Request Aayi:", title, message);

  try {
    // 🔹 STEP 0: Firebase Admin initialization check
    if (!admin.apps.length) {
      console.log("❌ Firebase Admin not initialized!");
      return res.status(500).json({ error: "Firebase init missing" });
    }

    // 🔹 STEP 1: Real-time Socket Alert
    io.emit("admin_alert", { title, message });
    console.log("📢 Real-time Socket Alert Emitted!");

    // 🔹 STEP 2: Database se FCM tokens fetch
    const users = await User.find(
      { fcmToken: { $exists: true, $ne: "" } },
      "fcmToken",
    );

    if (users.length === 0) {
      console.log("⚠️ DB mein Token nahi mila, par Socket Alert ja chuka hai!");
      return res
        .status(200)
        .json({ msg: "Socket alert sent, but no FCM tokens found in DB." });
    }

    // 🔹 STEP 3: Firebase Messaging (background notifications)
    const sendPromises = users.map((user) =>
      admin
        .messaging()
        .send({
          notification: { title, body: message },
          token: user.fcmToken,
        })
        .catch((err) => {
          console.log(`⚠️ Token failed for a user: ${err.message}`);
          return null; // Fail hone pe bhi baki tokens send hote rahenge
        }),
    );

    await Promise.all(sendPromises);

    console.log("✅ Admin Alert Fully Processed (Socket + Firebase)!");
    return res
      .status(200)
      .json({ msg: "Notification process complete (Socket + Firebase)!" });
  } catch (err) {
    console.error("❌ Global Admin Error:", err);
    return res
      .status(500)
      .json({ error: "Server side error or Firebase issue." });
  }
});

// Ai PRO //

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/ai/guide", async (req, res) => {
  console.log("🚀 BHAI, REQUEST AA GAYI!");

  const { message } = req.body;

  // Agar user ne empty message bheja toh error de do
  if (!message) {
    return res.status(400).json({ reply: "Bhai koi message toh bhej! 😅" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prompt ko theek se format karna
    const result = await model.generateContent(
      `Tu BR30TRADER Mentor hai. User ne pucha: ${message}`,
    );

    const text = result.response.text();

    console.log("🤖 AI Jawab:", text);

    res.json({ reply: text });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ reply: "AI abhi aaram kar raha hai 😅" });
  }
}); //Ai pro setup end

// API: Verify OTP
app.post("/api/admin/verify-otp", (req, res) => {
  const { otp } = req.body;
  if (parseInt(otp) === adminOTP) {
    adminOTP = null; // Ek baar login ke baad clear
    res.json({ success: true });
  } else {
    res.status(401).json({ msg: "Galat OTP hai bhai! ❌" });
  }
});

// ✅ Ye check karega ki variable hai ya nahi, taaki crash na ho
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
    : null;

if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase Admin Initialized!");
} else {
    console.log("⚠️ Firebase Service Account missing, skipping init.");
}


// 8. Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server with Socket.io running on port ${PORT}`);
});
//#endregion