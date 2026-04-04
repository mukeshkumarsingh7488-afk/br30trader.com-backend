//#region Order Model
// Ye model humare orders ke liye hai. Isme hum user, course, amount, payment ID, coupon used, aur status store karenge. 
// Jab bhi koi order place hoga, toh iska record yahan save ho jayega, taki hum future me usko access kar sakein.
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: { type: Number, required: true }, // Asli paisa jo bank mein aaya
    paymentId: { type: String, required: true }, // Razorpay Payment ID
    couponUsed: { type: String, default: "NONE" }, // Konsa coupon tha
    status: { type: String, default: "captured" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
//#endregion