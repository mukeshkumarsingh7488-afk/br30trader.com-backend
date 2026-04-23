//#region Certificate Model
// Ye model humare certificates ke liye hai. Isme hum certificate ka naam, ID, course, date, aur file name store karenge.
// Jab bhi koi certificate generate hoga, toh iska record yahan save ho jayega, taki hum future me usko access kar sakein.
const mongoose = require("mongoose");

const certSchema = new mongoose.Schema({
  name: String,
  certId: String,
  course: String,
  date: Date,
  fileName: String,
});

module.exports = mongoose.model("Certificate", certSchema);
//#endregion
