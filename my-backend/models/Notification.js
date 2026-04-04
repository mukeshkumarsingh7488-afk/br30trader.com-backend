//#region Notification Model
// Ye model humare notifications ke liye hai. Isme hum notification message, sender name, date, aur deletedBy field store karenge. 
// Jab bhi koi notification create hogi, toh iska record yahan save ho jayega, taki hum future me usko access kar sakein.
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  senderName: { type: String, default: "Admin Mukesh Raj" },
  date: { type: Date, default: Date.now },
  // Isme un users ki ID jayegi jo "Clear" dabayenge
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Notification", NotificationSchema);
//#endregion