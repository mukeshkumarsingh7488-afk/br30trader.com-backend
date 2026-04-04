//#region Trade Model
// Ye model humare trades ke liye hai. Isme hum user ID, trade ka naam, type (Buy/Sell), status (Profit/Loss), PnL, note, brokerage, aur date store karenge. 
// Jab bhi koi trade record hoga, toh iska record yahan save ho jayega, taki hum future me usko access kar sakein.
const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // यूजर की पहचान
  name: { type: String, required: true },
  type: { type: String, required: true }, // Buy or Sell
  status: { type: String, required: true }, // Profit or Loss
  pnl: { type: Number, required: true },
  note: { type: String },
  brokerage: { type: Number, default: 50 },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trade", tradeSchema);
//#endregion